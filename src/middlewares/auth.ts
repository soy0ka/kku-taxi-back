import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import JWT from '@/utils/auth/jwt'
import ResponseFormatter from '@/utils/formatter/response'
import { Logger } from '@/utils/logging/logger'
import { PrismaClient } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

const prisma = new PrismaClient()

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split('Bearer ')[1]
  if (!token) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
  try {
    const dbToken = await prisma.tokens.findFirst({ where: { token } })
    if (!dbToken) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.TOKEN_NOT_FOUND)).end()

    const decoded = JWT.verify(token)
    if (!decoded || !decoded.ok) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.INVALID_TOKEN)).end()

    const userId = Number(decoded.id)
    if (isNaN(userId)) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.INVALID_TOKEN)).end()

    const user = await prisma.user.findUnique({
      select: { id: true, name: true, email: true, banned: true, bankaccount: true },
      where: { id: userId }
    })

    if (!user) return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.USER_NOT_FOUND)).end()
    if (user.banned) return res.status(ApiStatusCode.FORBIDDEN).json(ResponseFormatter.error(CustomErrorCode.TEMPARAY_DISABLE)).end()

    res.locals.user = user
    next()
  } catch (error:any) {
    Logger.error(error.name).put(error.stack).out()
    return res.status(ApiStatusCode.UNAUTHORIZED).json(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
  }
}

export default authMiddleware
