import { CustomError } from '@/classes/CustomError'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { Logger } from '@/utils/logging/logger'
import { NextFunction, Request, Response } from 'express'

const errorHandler = (err: Error | CustomError, req: Request, res: Response, next: NextFunction) => {
  Logger.error('ErrorHandler').put(err.stack).out()

  if (err instanceof CustomError) {
    return res.status(err.statusCode).send(ResponseFormatter.error(err.errorCode)).end()
  } else {
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.UNKNOWN_ERROR)).end()
  }
}

export default errorHandler
