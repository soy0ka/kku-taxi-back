import { ApiStatusCode } from '@/types/Response'
import ResponseFormatter from '@/utils/ResponseFormatter'
import 'dotenv/config'
import express, { Request, Response } from 'express'

const app = express.Router()

app.get('/', async (req: Request, res: Response) => {
  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({ message: '여기에 공지를 적어주세요' })).end()
})

export default app
