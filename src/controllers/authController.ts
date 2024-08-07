import { CustomError } from '@/classes/CustomError'
import { generateCode, getUserOrCreate, signToken, verifyCode } from '@/services/authService'
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
export const verifyAuthCode = async (req: Request, res: Response) => {
  const { code } = req.body
  const deviceID = req.headers['x-device-id'] as string
  const platform = req.headers['x-device'] as string

  if (!code) return res.status(ApiStatusCode.BAD_REQUEST).send(responseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
  const status = await verifyCode(code)

  if (!status.valid || !status.userId) {
    if (status.expired) return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.AUTH_CODE_EXPIRED)).end()
    else return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.INVALID_AUTH_CODE)).end()
  }

  const { token } = await signToken(status.userId, { deviceID, platform })
  return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({ token })).end()
}
