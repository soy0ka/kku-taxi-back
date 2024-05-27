import 'dotenv/config'
import cors from 'cors'
import { v4 } from 'uuid'
import helmet from 'helmet'
import JWT from '../classes/JWT'
import { rsaDecrypt } from '../classes/RSA'
import { PrismaClient } from '@prisma/client'
import MiddleWare from '../classes/Middleware'
import Formatter from '../classes/ResponseFormat'
import express, { Request, Response } from 'express'

const app = express.Router()
const prisma = new PrismaClient()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/login', async (req: Request, res: Response) => {
  const { id, password } = req.body
  if (!id || !password) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()

  // const decrypted = await rsaDecrypt(password)
  // if (!decrypted) return res.status(500).send(Formatter.format(false, 'Internal Server Error')).end()

  // const dbuser = user || await prisma.user.create({ data: { membership: id, password, deviceId: v4().toUpperCase(), name: kuser.name } })

  // if (!dbuser) return res.status(401).send(Formatter.format(false, 'Not Found')).end()
  // if (dbuser.banned) return res.status(403).send(Formatter.format(false, 'Forbidden')).end()

  // const token = await JWT.sign(dbuser.id)
  // return res.status(200).send(Formatter.format(true, 'OK', { token })).end()
})

app.use(MiddleWare.auth)
app.get('/me', async (req: Request, res: Response) => {
  const payload = {
    id: res.locals.user.id,
    name: res.locals.user.name,
    banned: Boolean(res.locals.user.banned)
  }

  return res.status(200).send(Formatter.format(true, 'OK', payload)).end()
})

export default app
