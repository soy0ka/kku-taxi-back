import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { Logger } from '@/utils/logging/logger'
import { NextFunction, Request, Response } from 'express'
import { initializeApp } from 'firebase-admin'
import { applicationDefault } from 'firebase-admin/app'

const firebaseApp = initializeApp({ credential: applicationDefault() })

const appCheck = async (req: Request, res: Response, next: NextFunction) => {
  const appCheckToken = req.header('X-Firebase-AppCheck')
  if (!appCheckToken) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.INVALID_TOKEN)).end()

  try {
    const result = await firebaseApp.appCheck().verifyToken(appCheckToken).catch(() => false)
    if (!result) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
    next()
  } catch (error:any) {
    Logger.error(error.name).put(error.stack).out()
    return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
  }
}

export default appCheck
