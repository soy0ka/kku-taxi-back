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
    select: { id: true, users: true }
  })
}
