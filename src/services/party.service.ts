import { CustomError } from '@/classes/CustomError'
import { findBankAccountByUserId } from '@/models/bankAccount.model'
import { createMessage } from '@/models/message.model'
import { createParty, findParties, findPartyById, joinPartyById, updateParty } from '@/models/party.model'
import { emitCustomEvent } from '@/sockets/chatWebSocket'
import { CustomErrorCode } from '@/types/response'
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

  return { ...party }
}

export const checkIsJoined = async (userId: number, partyId: number) => {
  const party = await findPartyById(partyId)
  if (!party) return false
  return party.partyMemberships.some(membership => membership.userId === userId)
}

export const sendJoinSystemMessage = async (user: { id: number, name: string }, roomId: number) => {
  const message = {
    roomId,
    content: `${user.name}님이 파티에 참여했습니다`,
    senderId: user.id,
    isSystem: true,
    sender: { id: user.id, name: '시스템', textId: 'system' },
    timestamp: new Date()
  }
  await createMessage(message)

  await emitCustomEvent('messageCreate', {
    room: String(roomId),
    data: message
  })
}

export const joinParty = async (user: { id: number, name: string }, partyId: number) => {
  const party = await findPartyById(partyId)
  if (!party) throw new CustomError(CustomErrorCode.PARTY_NOT_FOUND)
  if (party.partyMemberships.some(membership => membership.userId === user.id)) throw new CustomError(CustomErrorCode.ALREADY_PARTY_MEMEBER)
  if (party._count.partyMemberships >= party.maxSize) throw new CustomError(CustomErrorCode.PARTY_FULL)

  const roomId = await joinPartyById(user.id, partyId)
  await sendJoinSystemMessage(user, roomId)
  return roomId
}

export const payForParty = async (userId: number, partyId: number, price: number, totalPrice: number) => {
  const party = await findPartyById(partyId)
  if (!party) throw new CustomError(CustomErrorCode.PARTY_NOT_FOUND)
  if (party.payRequested) throw new CustomError(CustomErrorCode.ALREADY_PAID)
  if (!party.partyMemberships.some(membership => membership.userId === userId)) throw new CustomError(CustomErrorCode.NO_PERMISSION)
  if (party.ownerId !== userId) throw new CustomError(CustomErrorCode.NO_PERMISSION)

  const ownerAccount = await findBankAccountByUserId(party.ownerId)
  if (!ownerAccount) throw new CustomError(CustomErrorCode.BANK_ACCOUNT_NOT_REGISTERED)

  const maskedName = ownerAccount.holder.split('').map((char, index) => index !== 1 ? char : '*').join('')
  const message = `방장이 정산을 요청했습니다 \n계좌번호: ${ownerAccount.bankName} ${ownerAccount.account} (예금주: ${maskedName})\n금액: ${price}원 (총액: ${totalPrice}원)`
  await createMessage({
    content: message,
    senderId: userId,
    roomId: party.chatRoomId,
    isSystem: true,
    sender: {
      id: userId,
      name: '시스템',
      textId: 'system'
    },
    timestamp: new Date()
  })

  await emitCustomEvent('messageCreate', {
    room: String(party.chatRoomId),
    data: message
  })

  await updateParty(partyId, { payRequested: true })

  return message
}
