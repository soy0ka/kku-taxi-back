import { getUserDevices } from '@/models/userModel'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import responseFormatter from '@/utils/formatter/response'
import { Request, Response } from 'express'

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = res.locals.user
  if (!user) return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.USER_NOT_FOUND)).end()

  return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(user)).end()
}

export const getUserInformation = async (req: Request, res: Response) => {
  const { id } = req.params
  return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({ id })).end()
}

export const getCurrentUserDevice = async (req: Request, res: Response) => {
  const user = res.locals.user
  if (!user) return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.USER_NOT_FOUND)).end()

  const devices = await getUserDevices(user.id)
  return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({ devices })).end()
}
