import { checkTokenValidity, findUserById } from '@/models/userModel'
import { CustomErrorCode } from '@/types/response'
import JWT from '@/utils/auth/jwt'
import { NextFunction, Request, Response } from 'express'

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split('Bearer ')[1]
  if (!token) throw new Error(CustomErrorCode.UNAUTHORIZED_TOKEN)
  try {
    const dbToken = await checkTokenValidity(token)
    if (!dbToken) throw new Error(CustomErrorCode.TOKEN_NOT_FOUND)

    const decoded = JWT.verify(token)
    if (!decoded || !decoded.ok) throw new Error(CustomErrorCode.INVALID_TOKEN)

    const userId = Number(decoded.id)
    if (isNaN(userId)) throw new Error(CustomErrorCode.INVALID_TOKEN)

    const user = await findUserById(userId)

    if (!user) throw new Error(CustomErrorCode.USER_NOT_FOUND)
    if (user.banned) throw new Error(CustomErrorCode.TEMPARAY_DISABLE)

    res.locals.user = user
    next()
  } catch (error:any) {
    next(error)
  }
}

export default authMiddleware
