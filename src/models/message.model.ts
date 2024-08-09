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
