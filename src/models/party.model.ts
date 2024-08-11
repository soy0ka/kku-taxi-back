import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const findParties = async (partyConditions: any, skip: number, pageSize: number) => {
  return prisma.party.findMany({
    where: partyConditions,
    orderBy: { departure: 'asc' },
    skip,
    take: pageSize,
    include: {
      _count: { select: { partyMemberships: true } },
      fromPlace: true,
      toPlace: true,
      owner: { select: { id: true, name: true, email: true } }
    }
  })
}

export const createParty = async (partyData: Prisma.PartyCreateInput) => {
  const party = await prisma.party.create({ data: partyData, include: { partyMemberships: true, _count: { select: { partyMemberships: true } } } })
  return party
}

export const findPartyById = async (partyId: number) => {
  return prisma.party.findUnique({ where: { id: partyId }, include: { partyMemberships: true, _count: { select: { partyMemberships: true } } } })
}

export const findPartyMemberships = async (partyId: number, userId: number) => {
  return prisma.partyMembership.findFirst({ where: { partyId, userId } })
}

export const createPartyMembership = async (membershipData: any) => {
  return prisma.partyMembership.create({ data: membershipData })
}

export const updateParty = async (partyId: number, data: any) => {
  return prisma.party.update({ where: { id: partyId }, data })
}

export const findPartyByChatRoomId = async (chatRoomId: number) => {
  return prisma.party.findFirst({
    where: { chatRoomId },
    select: { fromPlace: true, name: true, toPlace: true, departure: true, ownerId: true, partyMemberships: { select: { User: true } }, _count: true, maxSize: true, id: true, payRequested: true }
  })
}

export const findPartyByOwnerId = async (ownerId: number) => {
  return prisma.party.findMany({ where: { ownerId }, select: { id: true, name: true, departure: true, fromPlace: true, toPlace: true, _count: { select: { partyMemberships: true } }, maxSize: true } })
}

export const joinPartyById = async (userId: number, partyId: number) => {
  const room = await prisma.chatRoom.update({ where: { id: partyId }, data: { users: { connect: { id: userId } } } })
  await prisma.partyMembership.create({ data: { userId, partyId } })
  return room.id
}
