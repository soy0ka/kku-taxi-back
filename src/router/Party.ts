import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import MiddleWare from '../classes/Middleware'
import Formatter from '../classes/ResponseFormat'
import express, { Request, Response } from 'express'

const app = express.Router()
const prisma = new PrismaClient()

app.use(MiddleWare.auth)
app.post('/create', async (req: Request, res: Response) => {
  return res.status(200).send(Formatter.format(true, 'OK')).end()
})

export default app
