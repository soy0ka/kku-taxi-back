import { Logger } from '@/utils/logging/logger'
import { NextFunction, Request, Response } from 'express'

const logMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  const userAgent = req.headers['user-agent']
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const platform = req.headers['x-platform']
  const deviceID = req.headers['x-device-id']

  const userId = res.locals.user?.id

  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    const baseLog = Logger.log(String(res.statusCode)).put(`${req.method} ${req.originalUrl}`)
      .next('IP').put(ip)
      .next('user-agent').put(userAgent)
      .next('Response Time').put(`${responseTime}ms`)

    if (platform) baseLog.next('Platform').put(platform)
    if (deviceID) baseLog.next('Device ID').put(deviceID)
    if (userId) baseLog.next('User ID').put(userId).out()
    else baseLog.out()
  })
  next()
}

export default logMiddleware
