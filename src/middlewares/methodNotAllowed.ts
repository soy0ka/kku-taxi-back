import { CustomError } from '@/classes/CustomError'
import { CustomErrorCode } from '@/types/response'
import { NextFunction, Request, Response } from 'express'

const methodNotAllowedHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    throw new CustomError(CustomErrorCode.METHOD_NOT_ALLOWED)
  } catch (error) {
    next(error)
  }
}

export default methodNotAllowedHandler
