import { Logger } from '@/utils/logging/logger'
import { Socket } from 'socket.io'

export const handleDisconnect = (socket: Socket) => {
  Logger.info('ChatManager').put('A user disconnected')
    .next('id').put(socket.id)
    .out()
}
