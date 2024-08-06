import { createMessage, findChatRoomById } from '@/models/chatModel'
import { getUserDevices } from '@/models/userModel'
import { Message } from '@/types/system/chat'
import { Logger } from '@/utils/logging/logger'
import PushNotification from '@/utils/notifications/push'
import { Namespace, Socket } from 'socket.io'
import { emitMessage } from './emitMessage'

export const handleMessageCreate = async (io: Namespace, socket: Socket, message: Message) => {
  try {
    const dbMessage = await createMessage(message)

    const sender = {
      id: message.sender.id,
      name: message.sender.name,
      textId: message.sender.textId,
      profileImage: message.sender.profileImage
    }

    const room = await findChatRoomById(Number(message.roomId))

    emitMessage(io, String(message.roomId), { ...dbMessage, sender })
    Logger.log('ChatManager')
      .put('Message sent')
      .next('id').put(socket.id)
      .next('room').put(message.roomId)
      .next('message').put(message.content)
      .out()

    if (room) {
      for (const user of room.users) {
        if (user.id === message.senderId) continue
        const tokens = await getUserDevices(user.id).then(devices => devices
          .map(device => device.deviceToken)
          .filter(token => token !== null)
        )

        await PushNotification.send(tokens, '새로운 메세지가 있습니다', message.content)
      }
    }
  } catch (error) {
    Logger.error('ChatManager')
      .put('Error creating message')
      .next('id').put(socket.id)
      .next('error').put(error)
      .out()
  }
}
