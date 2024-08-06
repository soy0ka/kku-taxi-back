import { Logger } from '@/utils/logging/logger'
import { Namespace, Socket } from 'socket.io'
import { getSocketServer } from '.'
import { handleDisconnect } from './chat/handleDisconnect'
import { handleJoinRoom } from './chat/handleJoinRoom'
import { handleMessageCreate } from './chat/handleMessageCreate'

export const registerChatHandlers = (io: Namespace) => {
  io.on('connection', (socket: Socket) => {
    Logger.info('WebSocket Server')
      .put('Connected')
      .next('id').put(socket.id)
      .next('ip').put(socket.handshake.address)
      .next('user-agent').put(socket.handshake.headers['user-agent'])
      .out()

    socket.on('joinRoom', (room) => handleJoinRoom(socket, room))
    socket.on('messageCreate', (message) => handleMessageCreate(io, socket, message))
    socket.on('disconnect', () => handleDisconnect(socket))
  })
}

export const emitCustomEvent = (eventName: string, options: {
  room: string
  data: any
}) => {
  const io = getSocketServer().of('/chat')
  io.to(options.room).emit(eventName, options.data)
}
