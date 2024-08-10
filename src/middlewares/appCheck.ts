import { CustomError } from '@/classes/CustomError'
import { CustomErrorCode } from '@/types/response'
import { NextFunction, Request, Response } from 'express'
import { initializeApp } from 'firebase-admin'
import { applicationDefault } from 'firebase-admin/app'

const firebaseApp = initializeApp({ credential: applicationDefault() })

const appCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appCheckToken = req.header('X-Firebase-AppCheck')
    if (!appCheckToken) throw new CustomError(CustomErrorCode.INVALID_TOKEN)

    const result = await firebaseApp.appCheck().verifyToken(appCheckToken).catch(() => false)
    if (!result) throw new CustomError(CustomErrorCode.INVALID_TOKEN)
    next()
  } catch (error) {
    next(error)
  }
}

export default appCheck
