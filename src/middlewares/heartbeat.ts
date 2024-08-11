import { ApiStatusCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { NextFunction, Request, Response } from 'express'

const heartbeat = (req: Request, res: Response, next: NextFunction) => {
  res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({
    message: 'OK',
    timestamp: Date.now(),
    uptime: process.uptime()
  })).end()
}

export default heartbeat
