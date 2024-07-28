import 'dotenv/config'

import { ApiStatusCode, CustomErrorCode } from '@/types/Response'
import ResponseFormatter from '@/utils/ResponseFormatter'
import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'
import { emitEvent } from '../classes/ChatManager'
import MiddleWare from '../classes/Middleware'
import Notification from '../classes/PushNotification'
import generate from '../classes/RandomName'
import { Logger } from '../utils/Logger'

const app = express.Router()
const prisma = new PrismaClient()

app.use(MiddleWare.auth)
app.get('/', async (req: Request, res: Response) => {
  const { direction, page = '1', size = '10' } = req.query
  const pageNumber = parseInt(page as string, 10) || 1
  const pageSize = parseInt(size as string, 10) || 10
  const skip = (pageNumber - 1) * pageSize

  let partyConditions = { departure: { gte: new Date() }, toPlaceId: {} }

  if (direction === 'toSchool') {
    // 학교 방향 파티 | 도착지 id가 3,4,5,6,7,8,9 인 파티
    partyConditions = { ...partyConditions, toPlaceId: { in: [3, 4, 5, 6, 7, 8, 9] } }
  } else if (direction === 'fromSchool') {
    // 시내 방향 파티 | 도착지 id가 1,2 인 파티
    partyConditions = { ...partyConditions, toPlaceId: { in: [1, 2] } }
  }

  const parties = await prisma.party.findMany({
    where: partyConditions,
    orderBy: { departure: 'asc' },
    skip,
    take: pageSize,
    include: {
      _count: {
        select: { partyMemberships: true }
      },
      fromPlace: true,
      toPlace: true,
      owner: { select: { id: true, name: true, email: true } }
    }
  })

  // partymemberships 테이블의 partyId와 같은 컬럼수가 party.maxSize보다 작은 파티만 반환 (인원수가 충족되지 못한 파티만 반환)
  const filteredParties = parties.filter(party => party._count.partyMemberships < party.maxSize)
  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(filteredParties)).end()
})

app.post('/create', async (req: Request, res: Response) => {
  const { description, dateTime, departure, arrival, maxSize } = req.body
  if (!description || !dateTime || !departure || !arrival || !maxSize) {
    return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD))
  }
  const date = new Date(dateTime)
  if (date < new Date()) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.DATE_EXPIRED)).end()

  const name = generate()
  try {
    const party = await prisma.party.create({
      data: {
        name: `${name} 택시팟`,
        description,
        departure: date,
        maxSize: maxSize + 1,
        toPlace: { connect: { id: arrival } },
        fromPlace: { connect: { id: departure } },
        owner: { connect: { id: res.locals.user.id } },
        partyMemberships: { create: { User: { connect: { id: res.locals.user.id } } } },
        chatRoom: { create: { name: `${name} 채팅방`, users: { connect: { id: res.locals.user.id } } } }
      }
    })

    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(party)).end()
  } catch (e) {
    console.error(e)
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
})

app.post('/pay', async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(ApiStatusCode.UNAUTHORIZED).send(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()

  const { partyId, price, totalPrice } = req.body
  if (!partyId || !price || !totalPrice) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

  const party = await prisma.party.findUnique({ where: { id: partyId } })
  if (!party) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.PARTY_NOT_FOUND)).end()
  if (party.payRequested) return res.status(ApiStatusCode.TOO_MANY_REQUESTS).send(ResponseFormatter.error(CustomErrorCode.ALREADY_PAID)).end()
  if (party.ownerId !== res.locals.user.id) return res.status(ApiStatusCode.FORBIDDEN).send(ResponseFormatter.error(CustomErrorCode.NO_PERMISSION)).end()

  const ownerAccount = await prisma.bankAccount.findFirst({ where: { userId: party.ownerId } })
  try {
    const maskedName = ownerAccount?.holder.split('').map((char, index) => index !== 1 ? char : '*').join('')
    const room = await prisma.chatRoom.findUnique({ where: { id: party.chatRoomId }, select: { users: true, id: true } })
    if (!room) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.CHATROOM_NOT_FOUND)).end()

    const message = `방장이 정산을 요청했습니다 \n계좌번호: ${ownerAccount?.bankName} ${ownerAccount?.account} (예금주: ${maskedName})\n금액: ${price}원 (총액: ${totalPrice}원)`
    await prisma.message.create({ data: { content: message, senderId: res.locals.user.id, chatRoomId: room.id, isSystem: true } })

    for (const user of room.users) {
      const tokens = await prisma.tokens.findMany({ where: { userId: user.id } })
      if (tokens.length === 0) continue
      for (const token of tokens) {
        if (!token.deviceToken) continue
        Notification.sendMessageNotification(token.deviceToken, '새로운 정산요청이 있습니다', {
          content: `계좌번호: ${ownerAccount?.bankName} ${ownerAccount?.account} (예금주: ${maskedName})\n금액: ${price}원 (총액: ${totalPrice}원)`,
          senderName: '시스템',
          senderProfileImage: null,
          timestamp: new Date().toISOString()
        })
      }
    }
    await prisma.party.update({ where: { id: party.id }, data: { payRequested: true } })
    emitEvent('messageCreate', { content: message, senderId: res.locals.user.id, roomId: room.id, isSystem: true, sender: { id: res.locals.user.id, name: res.locals.user.name, textId: res.locals.user.textId } })
    Logger.log('ChatManager').put('System message sent').next('id').next('room').put(room.id).next('message').put('정산요청').out()
  } catch (e) {
    Logger.error('PartyPay').put(e).out()
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
})

app.get('/join/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  if (!id) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
  const party = await prisma.party.findUnique({ where: { id: parseInt(id, 10) }, include: { _count: { select: { partyMemberships: true } } } })
  if (!party) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.PARTY_NOT_FOUND)).end()

  const isJoined = await prisma.partyMembership.findFirst({ where: { partyId: party.id, userId: res.locals.user.id } })
  if (isJoined) return res.status(ApiStatusCode.FORBIDDEN).send(ResponseFormatter.error(CustomErrorCode.ALREADY_PARTY_MEMEBER)).end()
  if (party._count.partyMemberships >= party.maxSize) return res.status(ApiStatusCode.FORBIDDEN).send(ResponseFormatter.error(CustomErrorCode.PARTY_FULL)).end()

  try {
    await prisma.partyMembership.create({ data: { partyId: party.id, userId: res.locals.user.id } })
    const room = await prisma.chatRoom.update({ where: { id: party.chatRoomId }, data: { users: { connect: { id: res.locals.user.id } } }, select: { users: true, id: true } })
    await prisma.message.create({ data: { content: `${res.locals.user.name}님이 파티에 참여했습니다`, senderId: res.locals.user.id, chatRoomId: room.id, isSystem: true } })
    Logger.log('ChatManager').put('System message sent').next('id').next('room').put(room.id).next('message').put(`${res.locals.user.name}님이 파티에 참여했습니다`).out()
    if (!room) return
    for (const user of room.users) {
      const tokens = await prisma.tokens.findMany({ where: { userId: user.id } })
      if (tokens.length === 0) continue
      for (const token of tokens) {
        if (!token.deviceToken) continue
        Notification.sendMessageNotification(token.deviceToken, '새로운 메시지', {
          content: `${res.locals.user.name}님이 파티에 참여했습니다`,
          senderName: '시스템',
          senderProfileImage: null,
          timestamp: new Date().toISOString()
        })
      }
    }
    emitEvent('messageCreate', { content: `${res.locals.user.name}님이 파티에 참여했습니다`, senderId: res.locals.user.id, roomId: room.id, isSystem: true, sender: { id: res.locals.user.id, name: res.locals.user.name, textId: res.locals.user.textId } })

    if (party._count.partyMemberships + 1 === party.maxSize) {
      const tokens = await prisma.tokens.findMany({ where: { userId: party.ownerId } })
      if (tokens.length === 0) return
      for (const token of tokens) {
        if (!token.deviceToken) continue
        Notification.send(token.deviceToken, `${party.name} 파티의 모집이 완료되었습니다`, '사용자들과 채팅을 시작해보세요!')
      }
    }

    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({})).end()
  } catch (e) {
    Logger.error('PartyJoin').put(e).out()
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
})

app.get('/chat/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  if (!id) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

  const chatRoom = await prisma.chatRoom.findUnique({ where: { id: parseInt(id, 10) } })
  if (!chatRoom) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.CHATROOM_NOT_FOUND)).end()
  const party = await prisma.party.findFirst({ where: { chatRoomId: chatRoom.id }, select: { fromPlace: true, name: true, toPlace: true, departure: true, ownerId: true, partyMemberships: { select: { User: true } }, _count: true, maxSize: true, id: true, payRequested: true } })
  if (!party) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.PARTY_NOT_FOUND)).end()
  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(party)).end()
})

export default app
