import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { NextFunction, Request, Response } from 'express'

const notFoundHandler = async (req: Request, res: Response, next: NextFunction) => {
  res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.PAGE_NOT_FOUND)).end()
}

export default notFoundHandler
