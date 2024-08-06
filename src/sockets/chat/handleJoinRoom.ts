import { Logger } from '@/utils/logging/logger'
import { Socket } from 'socket.io'

export const handleJoinRoom = (socket: Socket, room: string) => {
  socket.join(room)

  Logger.log('Chat Manager').put('A user joined')
    .next('id').put(socket.id)
    .next('room').put(room)
    .out()
}
