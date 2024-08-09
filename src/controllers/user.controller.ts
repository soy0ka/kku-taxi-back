import { CustomError } from '@/classes/CustomError'
import { getCurrentUser, getUserDevicesInfo, updateUserDeviceInfo } from '@/services/user.service'
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
export const getCurrentUserDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = res.locals.user
    const result = await getUserDevicesInfo(user.id)

    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(result)).end()
  } catch (error) {
    next(error)
  }
}

// PATCH /user/@me/devices/
export const updateCurrentUserDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = res.locals.user
    const deviceId = res.locals.deviceID
    const { pushToken } = req.body
    if (!deviceId) throw new CustomError(CustomErrorCode.DEVICE_NOT_FOUND)
    if (!pushToken) throw new CustomError(CustomErrorCode.REQUIRED_FIELD)

    const result = await updateUserDeviceInfo(user.id, deviceId, pushToken)

    return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error) {
    next(error)
  }
}
