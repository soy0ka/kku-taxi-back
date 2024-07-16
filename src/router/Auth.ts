import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import express, { Request, Response } from 'express'
import { v4 } from 'uuid'
import JWT from '../classes/JWT'
import Mailer from '../classes/Mailer'
import MiddleWare from '../classes/Middleware'
import RandomName from '../classes/RandomName'
import Formatter from '../classes/ResponseFormat'

const app = express.Router()
const prisma = new PrismaClient()

app.post('/login', async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()
  if (!Mailer.MailRegex.test(email)) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()

  // uuid가 이미 존재할경우 다시 생성 하는 로직
  while (true) {
    const uuid = v4()
    if (!await prisma.user.findFirst({ where: { uuid } })) {
      await prisma.user.create({ data: { email, uuid, name: RandomName() } })
      break
    }
  }
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) return res.status(500).send(Formatter.format(false, 'Internal Server Error')).end()
  if (user.banned) return res.status(403).send(Formatter.format(false, 'Forbidden')).end()

  const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  Mailer.sendCode(email, code)

  const expiredAt = new Date(new Date().getTime() + 1000 * 60 * 5)
  await prisma.authCode.create({ data: { code, expiredAt, User: { connect: { id: user.id } } } })
  return res.status(200).send(Formatter.format(true, 'OK', { validtime: expiredAt })).end()
})

app.post('/code', async (req: Request, res: Response) => {
  const { code } = req.body
  const deviceID = req.headers['x-device-id']
  const platform = req.headers['x-device']

  if (!code) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()

  const dbcode = await prisma.authCode.findFirst({ where: { code }, include: { User: true } })
  if (!dbcode) return res.status(404).send(Formatter.format(false, 'Not Found')).end()

  if (dbcode.expiredAt < new Date()) return res.status(403).send(Formatter.format(false, 'Forbidden')).end()
  const token = JWT.sign(dbcode.User.id)
  if (dbcode.userId !== 9999) await prisma.authCode.delete({ where: { id: dbcode.id } })
  await prisma.tokens.create({
    data: {
      device: String(deviceID),
      platform: String(platform),
      expiredAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 14),
      User: { connect: { id: dbcode.User.id } },
      token
    }
  })
  return res.status(200).send(Formatter.format(true, 'OK', { token })).end()
})

app.use(MiddleWare.auth)
app.get('/me', async (req: Request, res: Response) => {
  const textId = res.locals.user.email.split('@')[0]
  const payload = {
    id: res.locals.user.id,
    name: res.locals.user.name,
    email: res.locals.user.email,
    textId,
    banned: Boolean(res.locals.user.banned),
    account: res.locals.user.bankaccount[0] || null
  }
  console.log(payload)
  return res.status(200).send(Formatter.format(true, 'OK', payload)).end()
})

app.post('/account', async (req: Request, res: Response) => {
  const { number, bank, holder } = req.body
  if (!number || !bank || !holder) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()
  try {
    await prisma.bankAccount.deleteMany({ where: { userId: res.locals.user.id } })
    await prisma.user.update({ where: { id: res.locals.user.id }, data: { bankaccount: { create: { account: number, bankName: bank, holder } } } })
    return res.status(200).send(Formatter.format(true, 'OK')).end()
  } catch (error) {
    return res.status(500).send(Formatter.format(false, 'Internal Server Error')).end()
  }
})

app.get('/logout', async (req: Request, res: Response) => {
  const token = req.headers.authorization
  if (!token) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()

  const status = await prisma.tokens.deleteMany({ where: { token } })
  if (!status) return res.status(500).send(Formatter.format(false, 'Internal Server Error')).end()

  return res.status(200).send(Formatter.format(true, 'OK')).end()
})

app.post('/logout', async (req: Request, res: Response) => {
  const { token } = req.body
  if (!token) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()
  if (res.locals.user.id !== (await prisma.tokens.findFirst({ where: { token } }))?.userId) return res.status(403).send(Formatter.format(false, 'Forbidden')).end()

  const status = await prisma.tokens.deleteMany({ where: { token } })
  if (!status) return res.status(500).send(Formatter.format(false, 'Internal Server Error')).end()

  return res.status(200).send(Formatter.format(true, 'OK')).end()
})

app.get('/mydevice', async (req: Request, res: Response) => {
  const tokens = await prisma.tokens.findMany({ where: { userId: res.locals.user.id } })
  return res.status(200).send(Formatter.format(true, 'OK', tokens)).end()
})

app.post('/notification', async (req: Request, res: Response) => {
  const { token } = req.body
  const authToken = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(400).send(Formatter.format(false, 'Bad Request')).end()

  await prisma.tokens.updateMany({ where: { token: authToken }, data: { deviceToken: token } })
})

export default app
