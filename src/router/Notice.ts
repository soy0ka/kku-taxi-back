import 'dotenv/config'
import Formatter from '../classes/ResponseFormat'
import express, { Request, Response } from 'express'

const app = express.Router()

app.get('/', async (req: Request, res: Response) => {
  return res.status(200).send(Formatter.format(
    true, 'OK', '베타 서비스입니다 아직 불안정 할 수 있어요!'
  )).end()
})

export default app
