import { Namespace } from 'socket.io'

export const emitMessage = (io: Namespace, roomId: string, message: object) => {
  io.to(roomId).emit('messageCreate', { message })
}
