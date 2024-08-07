import { Message } from '@/types/system/chat'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createMessage = async (message: Message) => {
  return prisma.message.create({
    data: {
      content: message.content,
      senderId: message.senderId,
      chatRoomId: Number(message.roomId),
      isSystem: message.isSystem || false
    }
  })
}

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

export const getMessagesByRoomId = async (chatRoomId: number) => {
  return prisma.message.findMany({
    select: {
      id: true,
      content: true,
      createdAt: true,
      isdeleted: true,
      isSystem: true,
      sender: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    where: {
      chatRoomId,
      NOT: { isdeleted: true }
    }
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
