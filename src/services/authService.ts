import { createAuthCode, deleteAuthCode, getAuthCode } from '@/models/authcodeModel'
import { createUser, findUserByEmail, saveToken } from '@/models/userModel'
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

  if (!authCode) return { valid: false, expired: false, userId: null }
  if (authCode.expiredAt < new Date()) return { valid: false, expired: true, userId: authCode.userId }
  else {
    await deleteAuthCode(authCode.id)
    return { valid: true, expired: false, userId: authCode.userId }
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
