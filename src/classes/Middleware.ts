// import { Logger } from '../utils/Logger'
import Formatter from './ResponseFormat'
import { Logger } from '../utils/Logger'
import firebaseAdmin from 'firebase-admin'
import { Request, Response, NextFunction } from 'express'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { PrismaClient } from '@prisma/client'
import JWT from './JWT'

const db = new PrismaClient()

export default class MiddleWare {
  private static firebaseApp = initializeApp({ credential: applicationDefault() })
  public static async log (req: Request, res: Response, next: NextFunction) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']
    const deviceID = req.headers['x-device-id']
    const platform = req.headers['x-platform']

    Logger.log(req.method).put(req.params?.[0])
      .next('ip').put(ip)
      .next('user-agent').put(userAgent)
      .next('DeviceID').put(deviceID)
      .next('Platform').put(platform)
      .out()
    next()
  }

  public static async verify (req: Request, res: Response, next: NextFunction) {
    const appCheckToken = req.header('X-Firebase-AppCheck')
    if (!appCheckToken) return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
    try {
      const result = await firebaseAdmin.appCheck().verifyToken(appCheckToken).catch(() => false)
      if (!result) return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
      next()
    } catch (error:any) {
      Logger.error(error.name).put(error.stack).out()
      return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
    }
  }

  public static async auth (req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.split('Bearer ')[1]
    if (!token) return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
    try {
      const dbToken = await db.tokens.findFirst({ where: { token } })
      if (!dbToken) return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()

      const decoded = JWT.verify(token)
      if (!decoded || !decoded.ok) return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()

      const user = await db.user.findUnique({ where: { id: decoded.id } })
      if (!user) return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
      if (user.banned) return res.status(401).json(Formatter.format(false, 'Banned')).end()

      res.locals.user = user
      next()
    } catch (error:any) {
      Logger.error(error.name).put(error.stack).out()
      return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
    }
  }
}
