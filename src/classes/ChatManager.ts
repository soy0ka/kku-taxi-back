import { Logger } from '../utils/Logger'
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'

const setupSocketServer = (server: HTTPServer) => {
  const io = new SocketIOServer(server)

  io.on('connection', (socket: Socket) => {
    Logger.info('ChatManager').put('A user connected')
    socket.on('join', (room: string) => {
      socket.join(room)
      Logger.log('ChatManager').put('A user joined').next('room').put(room)
    })

    socket.on('message', (room: string, message: string) => {
      io.to(room).emit('message', message)
      Logger.log('ChatManager').put('Message sent').next('room').put(room).next('message').put(message)
    })

    socket.on('disconnect', () => {
      Logger.info('ChatManager').put('A user disconnected')
    })
  })

  return io
}

export { setupSocketServer }
