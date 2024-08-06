import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'

let io: Server

export const initializeSocketServer = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  return io
}

export const getSocketServer = (): Server => {
  if (!io) {
    throw new Error('Socket server is not initialized')
  }
  return io
}
