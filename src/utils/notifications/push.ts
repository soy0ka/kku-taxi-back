import { BasePushPayload } from '@/types/system/expoPush'
import { post } from 'superagent'
import { Logger } from '../logging/logger'

export const sendRequest = async (body: object) => {
  try {
    const response = await post('https://exp.host/--/api/v2/push/send')
      .set({
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      })
      .send(body)
      .then(res => res.body)

    return response
  } catch (error) {
    Logger.error('Push Notification HTTP Request').put(error).out()
  }
}

export const send = async (expoPushToken: string | string[], title: string, message: string) => {
  const body: BasePushPayload = {
    title,
    priority: 'default',
    to: expoPushToken,
    body: message
  }

  try {
    const response = await sendRequest(body)
    Logger.info('Push Notification').put(response.data[0]?.status)
      .next('token').put(expoPushToken)
      .next('id').put(response.data[0]?.id)
      .next('message').put(message)
      .out()
  } catch (error) {
    Logger.error('Push Notification').put(error).out()
  }
}

export default {
  send, sendRequest
}
