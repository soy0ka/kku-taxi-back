import { BasePushPayload } from '@/types/system/expoPush'
import { post } from 'superagent'
import { Logger } from '../logging/logger'

const sendRequest = async (body: object) => {
  try {
    const response = await post('https://exp.host/--/api/v2/push/send')
      .set({
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      })
      .send(body)

    Logger.info('Push Notification HTTP Request').put(response).out()
  } catch (error) {
    Logger.error('Push Notification HTTP Request').put(error).out()
  }
}

const send = async (expoPushToken: string, title: string, message: string) => {
  const body: BasePushPayload = {
    title,
    priority: 'default',
    to: expoPushToken,
    body: message
  }

  try {
    await sendRequest(body)
    Logger.info('Push Notification').put('sent').out()
  } catch (error) {
    Logger.error('Push Notification').put(error).out()
  }
}

export default {
  send
}
