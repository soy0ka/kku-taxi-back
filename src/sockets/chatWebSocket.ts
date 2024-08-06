import { Message } from '@/types/system/chat'
import { Logger } from '@/utils/logging/logger'
import { PrismaClient } from '@prisma/client'
import { Server, Socket } from 'socket.io'
const prisma = new PrismaClient()

const handleJoinRoom = (socket: Socket, room: string) => {
  socket.join(room)
  Logger.log('ChatManager').put('A user joined').next('id').put(socket.id).next('room').put(room).out()
}

const handleMessageCreate = async (io: Server, socket: Socket, message: Message) => {
  try {
    const dbMessage = await prisma.message.create({
      data: {
        content: message.content,
        senderId: message.senderId,
        chatRoomId: Number(message.roomId),
        isSystem: message.isSystem || false
      }
    })

    const sender = {
      id: message.sender.id,
      name: message.sender.name,
      textId: message.sender.textId,
      profileImage: message.sender.profileImage
    }

    io.to(String(message.roomId)).emit('messageCreate', { ...dbMessage, sender })

    const room = await prisma.chatRoom.findUnique({
      select: { users: true },
      where: { id: Number(message.roomId) }
    })

    Logger.log('ChatManager').put('Message sent')
      .next('id').put(socket.id)
      .next('room').put(message.roomId)
      .next('message').put(message.content)
      .out()

    if (room) {
      for (const user of room.users) {
        if (user.id === message.senderId) continue
        const tokens = await prisma.tokens.findMany({ where: { userId: user.id } })
        for (const token of tokens) {
          if (token.deviceToken) {
            // Send push notification
          }
        }
      }
    }
  } catch (error) {
    Logger.error('ChatManager').put('Error creating message')
      .next('id').put(socket.id)
      .next('error').put(error)
      .out()
  }
}

const handleDisconnect = (socket: Socket) => {
  Logger.info('ChatManager').put('A user disconnected').next('id').put(socket.id).out()
}

export const registerChatHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    Logger.info('WebSocket Server').put('Connected')
      .next('id').put(socket.id)
      .next('ip').put(socket.handshake.address)
      .next('user-agent').put(socket.handshake.headers['user-agent'])
      .out()

    socket.on('joinRoom', (room) => handleJoinRoom(socket, room))
    socket.on('messageCreate', (message) => handleMessageCreate(io, socket, message))
    socket.on('disconnect', () => handleDisconnect(socket))
  })
}
