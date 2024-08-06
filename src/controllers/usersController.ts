import { getCurrentUserInfo, getUserDevicesInfo, getUserInfo, updateUserDeviceInfo } from '@/services/usersService'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import responseFormatter from '@/utils/formatter/response'
import { Request, Response } from 'express'

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = res.locals.user
  try {
    const result = await getCurrentUserInfo(user)
    return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error) {
    return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
  }
}

export const getUserInformation = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await getUserInfo(id)
    return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error) {
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(responseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
}

export const getCurrentUserDevice = async (req: Request, res: Response) => {
  const user = res.locals.user
  try {
    const result = await getUserDevicesInfo(user.id)
    return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error) {
    return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
  }
}

export const updateCurrentUserDevice = async (req: Request, res: Response) => {
  const user = res.locals.user
  const deviceId = req.params.id
  const { pushToken } = req.body

  try {
    const result = await updateUserDeviceInfo(user.id, Number(deviceId), pushToken)
    return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error) {
    return res.status(ApiStatusCode.BAD_REQUEST).send(responseFormatter.error(CustomErrorCode.INVALID_PARAMS)).end()
  }
}
