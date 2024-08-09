import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const findChatRoomById = async (chatRoomId: number) => {
  return prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
    select: {
      id: true,
      users: true,
      Party: {
        select: {
          id: true,
          name: true,
          maxSize: true,
          fromPlace: true,
          toPlace: true,
          departure: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              partyMemberships: true
            }
          }
        }
      }
    }
  })
}

export const getChatRoomsByUserId = async (userId: number) => {
  return prisma.chatRoom.findMany({
    select: {
      id: true,
      name: true,
      Party: {
        select: {
          id: true,
          name: true,
          fromPlace: true,
          toPlace: true,
          departure: true
        }
      }
    },
    where: {
      users: { some: { id: userId } },
      NOT: { isdeleted: true }
    }
  })
}

export const updateChatRoom = async (chatRoomId: number, userId: number) => {
  return prisma.chatRoom.update({
    where: { id: chatRoomId },
    data: { users: { connect: { id: userId } } },
    select: { users: true, id: true }
  })
}

export const checkMembership = async (userId: number, chatRoomId: number) => {
  const membership = await prisma.chatRoom.findFirst({
    where: {
      id: chatRoomId,
      users: { some: { id: userId } }
    }
  })

  return !!membership
}
