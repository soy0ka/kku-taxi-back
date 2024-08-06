import { generateCode, getUserOrCreate, signToken, verifyCode } from '@/services/authService'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import responseFormatter from '@/utils/formatter/response'
import Mailer from '@/utils/notifications/mailer'
import { Request, Response } from 'express'

export const login = async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) return res.status(ApiStatusCode.BAD_REQUEST).send(responseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
  if (!Mailer.MailRegex.test(email)) return res.status(ApiStatusCode.BAD_REQUEST).send(responseFormatter.error(CustomErrorCode.INVALID_EMAIL)).end()

  try {
    const user = await getUserOrCreate(email)

    if (user.banned) return res.status(ApiStatusCode.FORBIDDEN).send(responseFormatter.error(CustomErrorCode.TEMPARAY_DISABLE)).end()

    const { code, expiredAt } = await generateCode(user.id)
    Mailer.sendAuthCode(email, code)

    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({ validtime: expiredAt })).end()
  } catch (error) {
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(responseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
}

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

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = res.locals.user

  if (!user) return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.USER_NOT_FOUND)).end()
  return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(user)).end()
}
