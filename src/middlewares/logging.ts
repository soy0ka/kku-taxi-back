import { HHMMSSMMM } from '@/utils/formatter/date'
import { LogColor, Logger } from '@/utils/logging/logger'
import { NextFunction, Request, Response } from 'express'
import { v4 } from 'uuid'

const logMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  const userAgent = req.headers['user-agent']
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const platform = req.headers['x-platform']
  const deviceID = req.headers['x-device-id']

  const userId = res.locals.user?.id

  res.locals.deviceID = deviceID
  res.locals.ip = ip
  res.locals.userAgent = userAgent
  res.locals.platform = platform
  res.locals.requestId = v4()

  res.on('finish', () => {
    const finishedTime = Date.now()
    const responseTime = finishedTime - startTime

    const baseLog = Logger.log(String(res.statusCode)).put(`${req.method} ${req.originalUrl}`)
      .next('IP').put(ip)
      .next('user-agent').put(userAgent)

    // 응답시간에 따라 색상을 다르게 표시
    const responseTimeView = `${responseTime}ms (${HHMMSSMMM(startTime)} ~ ${HHMMSSMMM(finishedTime)})`
    if (responseTime > 1000) {
      Logger.warning().put('Response Time is too long').out()
      baseLog.next('Response Time').putS([LogColor.F_RED], responseTimeView)
    } else if (responseTime > 500) {
      baseLog.next('Response Time').putS([LogColor.F_YELLOW], responseTimeView)
    } else if (responseTime < 100) {
      baseLog.next('Response Time').putS([LogColor.F_GREEN], responseTimeView)
    } else {
      baseLog.next('Response Time').put(responseTimeView)
    }

    baseLog.next('Request-id').put(res.locals.requestId)
    if (platform) baseLog.next('Platform').put(platform)
    if (deviceID) baseLog.next('Device ID').put(deviceID)
    if (userId) baseLog.next('User ID').put(userId).out()
    else baseLog.out()
  })
  next()
}

export default logMiddleware
