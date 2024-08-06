import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { Logger } from '@/utils/logging/logger'
import { NextFunction, Request, Response } from 'express'

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  Logger.error(err.name).put(err.stack).out()
  res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.UNKNOWN_ERROR)).end()
}

export default errorHandler
