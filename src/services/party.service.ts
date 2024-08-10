import { createChatRoomByPartyId } from '@/models/chat.model'
import { createParty, findParties, findPartyById } from '@/models/party.model'
import { CreatePartyOptions } from '@/types/system/party'
import RandomName from '@/utils/RandomName'
import { Prisma } from '@prisma/client'

export const getParties = async (direction: string, pageNumber: number, pageSize: number) => {
  const skip = (pageNumber - 1) * pageSize
  let partyConditions: any = { departure: { gte: new Date() }, toPlaceId: {} }

  if (direction === 'toSchool') {
    partyConditions = { ...partyConditions, toPlaceId: { in: [3, 4, 5, 6, 7, 8, 9] } }
  } else if (direction === 'fromSchool') {
    partyConditions = { ...partyConditions, toPlaceId: { in: [1, 2] } }
  }

  const parties = await findParties(partyConditions, skip, pageSize)
  const filteredParties = parties.filter(party => party._count.partyMemberships < party.maxSize)
  return filteredParties
}

export const createNewParty = async (options: CreatePartyOptions) => {
  const name = RandomName()
  const partyData: Prisma.PartyCreateInput = {
    name: `${name} 택시팟`,
    description: options.description,
    departure: options.dateTime,
    maxSize: options.maxSize + 1,
    toPlace: { connect: { id: Number(options.arrival) } },
    fromPlace: { connect: { id: Number(options.departure) } },
    owner: { connect: { id: options.userId } },
    partyMemberships: { create: { User: { connect: { id: options.userId } } } },
    chatRoom: { create: { name: `${name} 채팅방`, users: { connect: { id: options.userId } } } }
  }
  const party = await createParty(partyData)
  const chatroom = await createChatRoomByPartyId(party.id, name)

  return { ...party, chatRoomId: chatroom.id }
}

export const checkIsJoined = async (userId: number, partyId: number) => {
  const party = await findPartyById(partyId)
  if (!party) return false
  return party.partyMemberships.some(membership => membership.userId === userId)
}

export const joinParty = async (userId: number, partyId: number) => {
  const party = await findPartyById(partyId)
  if (!party) return { success: false, message: 'Not Exists' }
  if (party.partyMemberships.some(membership => membership.userId === userId)) return { success: false, message: 'Already Joined' }
  if (party._count.partyMemberships >= party.maxSize) return { success: false, message: 'Party Full' }
}

// app.get('/join/:id', async (req: Request, res: Response) => {
//   const { id } = req.params
//   if (!id) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
//   const party = await prisma.party.findUnique({ where: { id: parseInt(id, 10) }, include: { _count: { select: { partyMemberships: true } } } })
//   if (!party) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.PARTY_NOT_FOUND)).end()

//   const isJoined = await prisma.partyMembership.findFirst({ where: { partyId: party.id, userId: res.locals.user.id } })
//   if (isJoined) return res.status(ApiStatusCode.FORBIDDEN).send(ResponseFormatter.error(CustomErrorCode.ALREADY_PARTY_MEMEBER)).end()
//   if (party._count.partyMemberships >= party.maxSize) return res.status(ApiStatusCode.FORBIDDEN).send(ResponseFormatter.error(CustomErrorCode.PARTY_FULL)).end()

//   try {
//     await prisma.partyMembership.create({ data: { partyId: party.id, userId: res.locals.user.id } })
//     const room = await prisma.chatRoom.update({ where: { id: party.chatRoomId }, data: { users: { connect: { id: res.locals.user.id } } }, select: { users: true, id: true } })
//     await prisma.message.create({ data: { content: `${res.locals.user.name}님이 파티에 참여했습니다`, senderId: res.locals.user.id, chatRoomId: room.id, isSystem: true } })
//     Logger.log('ChatManager').put('System message sent').next('id').next('room').put(room.id).next('message').put(`${res.locals.user.name}님이 파티에 참여했습니다`).out()
//     if (!room) return
//     for (const user of room.users) {
//       const tokens = await prisma.tokens.findMany({ where: { userId: user.id } })
//       if (tokens.length === 0) continue
//       for (const token of tokens) {
//         if (!token.deviceToken) continue
//         Notification.sendMessageNotification(token.deviceToken, '새로운 메시지', {
//           content: `${res.locals.user.name}님이 파티에 참여했습니다`,
//           senderName: '시스템',
//           senderProfileImage: null,
//           timestamp: new Date().toISOString()
//         })
//       }
//     }
//     emitEvent('messageCreate', { content: `${res.locals.user.name}님이 파티에 참여했습니다`, senderId: res.locals.user.id, roomId: room.id, isSystem: true, sender: { id: res.locals.user.id, name: res.locals.user.name, textId: res.locals.user.textId } })

//     if (party._count.partyMemberships + 1 === party.maxSize) {
//       const tokens = await prisma.tokens.findMany({ where: { userId: party.ownerId } })
//       if (tokens.length === 0) return
//       for (const token of tokens) {
//         if (!token.deviceToken) continue
//         Notification.send(token.deviceToken, `${party.name} 파티의 모집이 완료되었습니다`, '사용자들과 채팅을 시작해보세요!')
//       }
//     }

//     return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({})).end()
//   } catch (e) {
//     Logger.error('PartyJoin').put(e).out()
//     return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
//   }
// })
