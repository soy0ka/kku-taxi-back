import { getUserDevices, updateUserDevice } from '@/models/userModel'
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

export const updateCurrentUserDevice = async (req: Request, res: Response) => {
  const user = res.locals.user
  const deviceId = req.params.id
  const { pushToken } = req.body

  if (!deviceId || isNaN(Number(deviceId))) return res.status(ApiStatusCode.BAD_REQUEST).send(responseFormatter.error(CustomErrorCode.INVALID_PARAMS)).end()
  if (!pushToken) return res.status(ApiStatusCode.BAD_REQUEST).send(responseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

  const updated = await updateUserDevice(user.id, Number(deviceId), pushToken)
  if (!updated) return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(responseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()

  return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({})).end()
}
