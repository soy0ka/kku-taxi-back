import { CustomError } from '@/classes/CustomError'
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
  return devices
}

export const updateUserDeviceInfo = async (userId: number, deviceId: string, pushToken: string) => {
  const updated = await updateUserDevice(userId, deviceId, pushToken)
  console.log(updated)
  if (!updated) throw new CustomError(CustomErrorCode.DATABASE_ERROR)
  return responseFormatter.success({})
}
