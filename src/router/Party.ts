import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import express, { Request, Response } from 'express'
import { emitEvent } from '../classes/ChatManager'
import MiddleWare from '../classes/Middleware'
import Notification from '../classes/PushNotification'
import generate from '../classes/RandomName'
import Formatter from '../classes/ResponseFormat'
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

  // 추가적으로 partymemberships 테이블의 partyId와 같은 컬럼수가 party.maxSize보다 작은 파티만 반환 (인원수가 충족되지 못한 파티만 반환)
  const filteredParties = parties.filter(party => party._count.partyMemberships < party.maxSize)
  return res.status(200).send(Formatter.format(true, 'OK', filteredParties)).end()
})

app.post('/create', async (req: Request, res: Response) => {
  const { description, dateTime, departure, arrival, maxSize } = req.body
  if (!description || !dateTime || !departure || !arrival || !maxSize) return res.status(400).send(Formatter.format(false, 'Missing required fields')).end()
  const date = new Date(dateTime)
  if (date < new Date()) return res.status(400).send(Formatter.format(false, 'Invalid date')).end()
  const name = generate()
  try {
    const party = await prisma.party.create({
      data: {
        name: `${name} 택시팟`,
        description,
        departure: date,
        maxSize: maxSize + 1,
        chatRoom: { create: { name: `${name} 채팅방`, users: { connect: { id: res.locals.user.id } } } },
        fromPlace: { connect: { id: departure } },
        toPlace: { connect: { id: arrival } },
        owner: { connect: { id: res.locals.user.id } },
        partyMemberships: { create: { User: { connect: { id: res.locals.user.id } } } }

      }
    })

    return res.status(200).send(Formatter.format(true, 'OK', { id: party.chatRoomId })).end()
  } catch (e) {
    console.error(e)
    return res.status(500).send(Formatter.format(false, 'Internal server error')).end()
  }
})

app.post('/pay', async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(401).send(Formatter.format(false, 'Unauthorized')).end()
  const { partyId, price, totalPrice } = req.body
  if (!partyId || !price || !totalPrice) return res.status(400).send(Formatter.format(false, 'Missing required fields')).end()
  const party = await prisma.party.findUnique({ where: { id: partyId } })
  if (!party) return res.status(404).send(Formatter.format(false, 'Party not found')).end()
  if (party.payRequested) return res.status(429).send(Formatter.format(false, 'Payment already requested')).end()
  if (party.ownerId !== res.locals.user.id) return res.status(403).send(Formatter.format(false, 'Forbidden')).end()
  const ownerAccount = await prisma.bankAccount.findFirst({ where: { userId: party.ownerId } })
  try {
    const maskedName = ownerAccount?.holder.split('').map((char, index) => index !== 1 ? char : '*').join('')
    const room = await prisma.chatRoom.findUnique({ where: { id: party.chatRoomId }, select: { users: true, id: true } })
    if (!room) return res.status(404).send(Formatter.format(false, 'Chat room not found')).end()

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
    console.error(e)
    return res.status(500).send(Formatter.format(false, 'Internal server error')).end()
  }
})

app.get('/join/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  if (!id) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()
  const party = await prisma.party.findUnique({ where: { id: parseInt(id, 10) }, include: { _count: { select: { partyMemberships: true } } } })
  if (!party) return res.status(404).send(Formatter.format(false, 'Party not found')).end()
  const isJoined = await prisma.partyMembership.findFirst({ where: { partyId: party.id, userId: res.locals.user.id } })
  if (isJoined) return res.status(400).send(Formatter.format(false, 'Already joined')).end()
  if (party._count.partyMemberships >= party.maxSize) return res.status(400).send(Formatter.format(false, 'Party is full')).end()
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

    return res.status(200).send(Formatter.format(true, 'OK')).end()
  } catch (e) {
    console.error(e)
    return res.status(500).send(Formatter.format(false, 'Internal server error')).end()
  }
})

app.get('/chat/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  if (!id) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()

  const chatRoom = await prisma.chatRoom.findUnique({ where: { id: parseInt(id, 10) } })
  if (!chatRoom) return res.status(404).send(Formatter.format(false, 'Chat room not found')).end()
  const party = await prisma.party.findFirst({ where: { chatRoomId: chatRoom.id }, select: { fromPlace: true, name: true, toPlace: true, departure: true, ownerId: true, partyMemberships: { select: { User: true } }, _count: true, maxSize: true, id: true, payRequested: true } })
  if (!party) return res.status(404).send(Formatter.format(false, 'Party not found')).end()
  return res.status(200).send(Formatter.format(true, 'OK', party)).end()
})

export default app
