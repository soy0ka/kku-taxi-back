import { getCurrentUserInfo, getUserDevicesInfo, getUserInfo, updateUserDeviceInfo } from '@/services/userService'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import responseFormatter from '@/utils/formatter/response'
import { Request, Response } from 'express'

// GET /user/:idOrMe
export const getCurrentUserOrById = async (req: Request, res: Response) => {
  const { idOrMe } = req.params
  const user = res.locals.user

  try {
    let result
    if (idOrMe === '@me') {
      result = await getCurrentUserInfo(user)
    } else {
      result = await getUserInfo(idOrMe)
    }
    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(result)).end()
  } catch (error) {
    return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
  }
}

// GET /user/@me/devices
export const getCurrentUserDevice = async (req: Request, res: Response) => {
  const user = res.locals.user
  try {
    const result = await getUserDevicesInfo(user.id)
    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(result)).end()
  } catch (error) {
    return res.status(ApiStatusCode.UNAUTHORIZED).send(responseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
  }
}

// PATCH /user/@me/devices/:id
export const updateCurrentUserDevice = async (req: Request, res: Response) => {
  const user = res.locals.user
  const deviceId = req.params.id
  const { pushToken } = req.body

  if (!deviceId || !pushToken) return res.status(ApiStatusCode.BAD_REQUEST).send(responseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

  try {
    const result = await updateUserDeviceInfo(user.id, Number(deviceId), pushToken)
    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(result)).end()
  } catch (error) {
    return res.status(ApiStatusCode.BAD_REQUEST).send(responseFormatter.error(CustomErrorCode.INVALID_PARAMS)).end()
  }
}
