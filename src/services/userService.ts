import { findUserById, getUserDevices, updateUserDevice } from '@/models/userModel'
import { CustomErrorCode } from '@/types/response'
import responseFormatter from '@/utils/formatter/response'

export const getCurrentUser = async (id: number) => {
  const user = await findUserById(id)
  const textId = user?.email.split('@')[0]
  return { ...user, textId }
}

export const getUserInfo = async (id: number) => {
  const user = await findUserById(id)
  return user
}

export const getUserDevicesInfo = async (userId: number) => {
  const devices = await getUserDevices(userId)
  return responseFormatter.success({ devices })
}

export const updateUserDeviceInfo = async (userId: number, deviceId: number, pushToken: string) => {
  if (!deviceId || isNaN(deviceId)) {
    throw new Error(CustomErrorCode.INVALID_PARAMS)
  }
  if (!pushToken) {
    throw new Error(CustomErrorCode.REQUIRED_FIELD)
  }

  const updated = await updateUserDevice(userId, deviceId, pushToken)
  if (!updated) {
    throw new Error(CustomErrorCode.DATABASE_ERROR)
  }
  return responseFormatter.success({})
}
