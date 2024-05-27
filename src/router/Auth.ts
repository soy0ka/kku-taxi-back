import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import Mailer from '../classes/Mailer'
import JWT from '../classes/JWT'
import RandomName from '../classes/RandomName'
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
  const { email } = req.body
  if (!email) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()
  console.log(email)
  if (!Mailer.MailRegex.test(email)) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()

  const user = await prisma.user.findUnique({ where: { email } }) || await prisma.user.create({ data: { email, name: RandomName() } })
  if (!user) return res.status(500).send(Formatter.format(false, 'Internal Server Error')).end()
  console.log(user)
  if (user.banned) return res.status(403).send(Formatter.format(false, 'Forbidden')).end()

  const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  Mailer.send(email, '[쿠택시] 인증번호를 보내드립니다', `인증번호는 ${code}입니다 요청한 적 없으시다면 무시해주시길 바랍니다`)

  const expiredAt = new Date(new Date().getTime() + 1000 * 60 * 5)
  await prisma.authCode.create({ data: { code, expiredAt, User: { connect: { id: user.id } } } })
  return res.status(200).send(Formatter.format(true, 'OK', { validtime: expiredAt })).end()
})

app.post('/code', async (req: Request, res: Response) => {
  const { code } = req.body
  if (!code) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()

  const dbcode = await prisma.authCode.findFirst({ where: { code }, include: { User: true } })
  if (!dbcode) return res.status(404).send(Formatter.format(false, 'Not Found')).end()

  if (dbcode.expiredAt < new Date()) return res.status(403).send(Formatter.format(false, 'Forbidden')).end()
  const token = JWT.sign(dbcode.User.id)
  return res.status(200).send(Formatter.format(true, 'OK', { token })).end()
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
