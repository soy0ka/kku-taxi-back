import { CustomError } from '@/classes/CustomError'
import { createAuthCode, deleteAuthCode, getAuthCode } from '@/models/authcode.model'
import { createUser, findUserByEmail, saveToken } from '@/models/user.model'
import { CustomErrorCode } from '@/types/response'
import JWT from '@/utils/auth/jwt'
import { User } from '@prisma/client'

export const getUserOrCreate = async (email: string): Promise<User> => {
  let user = await findUserByEmail(email)
  if (!user) user = await createUser(email)

  return user
}

export const generateCode = async (userId: number) => {
  const { code, expiredAt } = await createAuthCode(userId)

  return { code, expiredAt }
}

export const verifyCode = async (code: string) => {
  const authCode = await getAuthCode(code)

  if (!authCode) throw new CustomError(CustomErrorCode.INVALID_AUTH_CODE)
  if (authCode.expiredAt < new Date()) throw new CustomError(CustomErrorCode.AUTH_CODE_EXPIRED)

  else {
    await deleteAuthCode(authCode.id)
    return authCode.userId
  }
}

export const signToken = async (userId: number, data: {
  deviceID: string
  platform: string
}) => {
  const token = JWT.sign(userId)
  const result = await saveToken(token, { userId, deviceID: data.deviceID, platform: data.platform })

  return { token, result }
}
