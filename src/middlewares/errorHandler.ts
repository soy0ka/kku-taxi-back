import { CustomError } from '@/classes/CustomError'
import ResponseFormatter from '@/utils/formatter/response'
import { Logger } from '@/utils/logging/logger'
import { Request, Response } from 'express'

const errorHandler = (err: CustomError, req: Request, res: Response) => {
  Logger.error('ErrorHandler').put(err.name)
    .next('Stack').put(err.stack)
    .out()

  res.status(err.statusCode).send(ResponseFormatter.error(err.errorCode)).end()
}

export default errorHandler
