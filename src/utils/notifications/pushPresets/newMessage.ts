import { Message } from '@/types/system/chat'
import { BasePushPayload } from '@/types/system/expoPush'

const newMessagePreset = (target: string | string[], message: Message) => {
  const body: BasePushPayload = {
    to: target,
    title: '새로운 메시지가 도착했습니다',
    body: `${message.sender.name}: ${message.content}`
  }

  return body
}

export default newMessagePreset
