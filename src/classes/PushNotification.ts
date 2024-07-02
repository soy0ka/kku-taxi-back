import { post } from 'superagent'
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

export default {
  send
}
