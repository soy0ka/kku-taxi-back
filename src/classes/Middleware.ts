// import { Logger } from '../utils/Logger'
import { ApiStatusCode, CustomErrorCode } from '@/types/Response'
import JWT from '@/utils/JWT'
import ResponseFormatter from '@/utils/ResponseFormatter'
import { PrismaClient } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { Logger } from '../utils/Logger'

const db = new PrismaClient()

export default class MiddleWare {
  // private static firebaseApp = initializeApp({ credential: applicationDefault() })
  public static async log (req: Request, res: Response, next: NextFunction) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']
    const deviceID = req.headers['x-device-id']
    // const platform = req.headers['x-platform']

    Logger.log(req.method).put(req.params?.[0])
      .next('ip').put(ip)
      .next('user-agent').put(userAgent)
      .next('DeviceID').put(deviceID)
      .out()
    next()
  }

  // firebase app check
  // public static async verify (req: Request, res: Response, next: NextFunction) {
  //   const appCheckToken = req.header('X-Firebase-AppCheck')
  //   if (!appCheckToken) return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
  //   try {
  //     const result = await firebaseAdmin.appCheck().verifyToken(appCheckToken).catch(() => false)
  //     if (!result) return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
  //     next()
  //   } catch (error:any) {
  //     Logger.error(error.name).put(error.stack).out()
  //     return res.status(401).json(Formatter.format(false, 'Invalid Token')).end()
  //   }
  // }

  public static async auth (req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.split('Bearer ')[1]
    if (!token) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
    try {
      const dbToken = await db.tokens.findFirst({ where: { token } })
      if (!dbToken) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.TOKEN_NOT_FOUND)).end()

      const decoded = JWT.verify(token)
      if (!decoded || !decoded.ok) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.INVALID_TOKEN)).end()

      const user = await db.user.findUnique({ select: { id: true, name: true, email: true, banned: true, bankaccount: true }, where: { id: Number(decoded.id) } })
      if (!user) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.USER_NOT_FOUND)).end()
      if (user.banned) return res.status(ApiStatusCode.FORBIDDEN).json(ResponseFormatter.error(CustomErrorCode.TEMPARAY_DISABLE)).end()

      res.locals.user = user
      next()
    } catch (error:any) {
      Logger.error(error.name).put(error.stack).out()
      return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
    }
  }
}
