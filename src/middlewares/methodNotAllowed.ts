import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { NextFunction, Request, Response } from 'express'

const methodNotAllowedHandler = async (req: Request, res: Response, next: NextFunction) => {
  res.status(ApiStatusCode.METHOD_NOT_ALLOWED).send(ResponseFormatter.error(CustomErrorCode.METHOD_NOT_ALLOWED)).end()
}

export default methodNotAllowedHandler
