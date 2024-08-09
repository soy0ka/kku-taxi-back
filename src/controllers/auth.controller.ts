import { CustomError } from '@/classes/CustomError'
import { generateCode, getUserOrCreate, signToken, verifyCode } from '@/services/auth.service'
import { updateUserDeviceInfo } from '@/services/user.service'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import responseFormatter from '@/utils/formatter/response'
import Mailer from '@/utils/notifications/mailer'
import { NextFunction, Request, Response } from 'express'

// POST /auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    if (!email) throw new CustomError(CustomErrorCode.REQUIRED_FIELD)
    if (!Mailer.MailRegex.test(email)) throw new CustomError(CustomErrorCode.INVALID_EMAIL)

    const user = await getUserOrCreate(email)
    if (user.banned) throw new CustomError(CustomErrorCode.TEMPARAY_DISABLE)

    const { code, expiredAt } = await generateCode(user.id)
    Mailer.sendAuthCode(email, code)

    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({ validtime: expiredAt })).end()
  } catch (error) {
    next(error)
  }
}

// POST /auth/code
export const verifyAuthCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body
    const deviceID = req.headers['x-device-id'] as string
    const platform = req.headers['x-device'] as string

    if (!code) throw new CustomError(CustomErrorCode.REQUIRED_FIELD)
    const userId = await verifyCode(code)

    const { token } = await signToken(userId, { deviceID, platform })
    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({ token })).end()
  } catch (error) {
    next(error)
  }
}

// POST /auth/notification
export const registerPushToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = res.locals.user
    const { token } = req.body
    if (!token) throw new CustomError(CustomErrorCode.REQUIRED_FIELD)

    const updated = await updateUserDeviceInfo(user.id, user.deviceId, token)
    if (!updated) throw new CustomError(CustomErrorCode.DATABASE_ERROR)

    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({})).end()
  } catch (error) {
    next(error)
  }
}
