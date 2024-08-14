import { CustomError } from '@/classes/CustomError'
import { CustomErrorCode } from '@/types/response'
import { NextFunction, Request, Response } from 'express'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAppCheck } from 'firebase-admin/app-check'

// Firebase Admin SDK 초기화
const firebaseApp = initializeApp({ credential: applicationDefault() })

// AppCheck 인스턴스 생성
const appCheckInstance = getAppCheck(firebaseApp)

const appCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appCheckToken = req.header('X-App-Check-Token')
    if (!appCheckToken) throw new CustomError(CustomErrorCode.INVALID_TOKEN)

    const result = await appCheckInstance.verifyToken(appCheckToken).catch(() => false)
    if (!result) throw new CustomError(CustomErrorCode.INVALID_TOKEN)

    next()
  } catch (error) {
    next(error)
  }
}

export default appCheck
