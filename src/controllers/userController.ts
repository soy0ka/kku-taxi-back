import { getCurrentUser, getUserDevicesInfo, updateUserDeviceInfo } from '@/services/userService'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import responseFormatter from '@/utils/formatter/response'
import { NextFunction, Request, Response } from 'express'

// GET /user/:idOrMe
export const getCurrentUserOrById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrMe } = req.params
    const user = res.locals.user

    if (idOrMe === '@me') {
      const dbUser = await getCurrentUser(user.id)
      return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(dbUser)).end()
    } else {
      throw new Error(CustomErrorCode.NO_PERMISSION)
    }
  } catch (error) {
    next(error)
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
