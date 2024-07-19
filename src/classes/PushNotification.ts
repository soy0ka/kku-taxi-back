import { post } from 'superagent'
import { Message } from '../types'
const send = async (expoPushToken: string, title: string, message: string) => {
  const body = {
    to: expoPushToken,
    sound: 'default',
    title,
    body: message,
    data: { message }
  }

  try {
    const response = await post('https://exp.host/--/api/v2/push/send')
      .set({
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      })
      .send(body)
    console.log('Notification sent:', response.body)
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

const sendMessageNotification = async (expoPushToken: string, title: string, message: Message) => {
  const messagePayload = {
    to: expoPushToken,
    sound: 'default',
    title: `${message.senderName}님으로부터 새로운 메시지`,
    body: message.content,
    data: {
      type: 'chat_message',
      senderName: message.senderName,
      senderProfileImage: message.senderProfileImage,
      content: message.content,
      timestamp: message.timestamp
    }
  }
  try {
    await post('https://exp.host/--/api/v2/push/send')
      .set({
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      })
      .send(messagePayload)
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

export default {
  send,
  sendMessageNotification
}
