import { CustomError } from '@/classes/CustomError'
import { createBankAccount, findBankAccountByUserId, updateBankAccount } from '@/models/bankAccount.model'
import { findUserById, getUserDevices, updateUserDevice } from '@/models/user.model'
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

export const regiseterBankAccountByUserId = async (userId: number, bankName: string, accountNumber: string, accountHolder: string) => {
  const dbAccount = await findBankAccountByUserId(userId)
  if (!dbAccount) {
    const account = await createBankAccount({
      userId,
      bankName,
      account: accountNumber,
      holder: accountHolder
    })

    if (!account) throw new CustomError(CustomErrorCode.DATABASE_ERROR)
    return account
  } else {
    const account = await updateBankAccount(userId, {
      bankName,
      account: accountNumber,
      holder: accountHolder
    })

    if (!account) throw new CustomError(CustomErrorCode.DATABASE_ERROR)
    return account
  }
}
