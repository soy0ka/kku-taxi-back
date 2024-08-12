import { CustomError } from '@/classes/CustomError'
import { deleteUserDevice, getCurrentUser, getUserDevicesInfo, regiseterBankAccountByUserId, updateUserDeviceInfo } from '@/services/user.service'
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

// POST /user/:idOrMe/bankaccount
export const registerBankAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrMe } = req.params
    const user = res.locals.user
    const { bankName, accountNumber, accountHolder } = req.body

    if (idOrMe === '@me') {
      if (!bankName || !accountNumber || !accountHolder) throw new CustomError(CustomErrorCode.REQUIRED_FIELD)
      const account = await regiseterBankAccountByUserId(user.id, bankName, accountNumber, accountHolder)

      return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(account)).end()
    } else {
      throw new CustomError(CustomErrorCode.NO_PERMISSION)
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

    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(result)).end()
  } catch (error) {
    next(error)
  }
}

// DELETE /user/@me/devices/:deviceId
export const deleteCurrentUserDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = res.locals.user
    const { deviceId } = req.params
    const isNumeric = !Number.isNaN(parseInt(deviceId))

    if (!deviceId || !isNumeric) throw new CustomError(CustomErrorCode.DEVICE_NOT_FOUND)
    const currentUserDevices = await getUserDevicesInfo(user.id)

    if (!currentUserDevices.some((device) => device.id === parseInt(deviceId))) {
      throw new CustomError(CustomErrorCode.DEVICE_NOT_FOUND)
    }

    const result = await deleteUserDevice(user.id, parseInt(deviceId))
    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(result)).end()
  } catch (error) {
    next(error)
  }
}
