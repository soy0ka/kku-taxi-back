// socket.js
import { Logger } from '@/utils/Logger'
import Notification from '@/utils/PushNotification'
import { PrismaClient } from '@prisma/client'
import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'

const prisma = new PrismaClient()
let io: Server
export const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    Logger.info('WebSocket Server').put('Connected')
      .next('id').put(socket.id)
      .next('ip').put(socket.handshake.address)
      .next('user-agent').put(socket.handshake.headers['user-agent'])
      .out()

    socket.on('joinRoom', (room) => {
      socket.join(room)
      Logger.log('ChatManager').put('A user joined').next('id').put(socket.id).next('room').put(room).out()
    })

    socket.on('messageCreate', async (message) => {
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
        textId: message.sender.textId
      }
      io.to(message.roomId).emit('messageCreate', { ...dbMessage, sender })
      const room = await prisma.chatRoom.findUnique({ select: { users: true }, where: { id: Number(message.roomId) } })
      Logger.log('ChatManager').put('Message sent').next('id').put(socket.id).next('room').put(message.roomId).next('message').put(message.content).out()
      if (!room) return
      for (const user of room.users) {
        if (user.id === message.senderId) continue
        const tokens = await prisma.tokens.findMany({ where: { userId: user.id } })
        if (tokens.length === 0) continue
        for (const token of tokens) {
          if (!token.deviceToken) continue
          Notification.sendMessageNotification(token.deviceToken, '새로운 메시지', {
            content: message.content,
            senderName: message.sender.name,
            senderProfileImage: message.sender.profileImage,
            timestamp: message.timestamp
          })
        }
      }
    })

    socket.on('disconnect', () => {
      Logger.info('ChatManager').put('A user disconnected').next('id').put(socket.id).out()
    })
  })

  return io
}

export const emitEvent = (event: string, data: any) => {
  if (io) {
    io.emit(event, data)
  } else {
    Logger.error('ChatManager').put('Socket is not initialized').out()
  }
}
