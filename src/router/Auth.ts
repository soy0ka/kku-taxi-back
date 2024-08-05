import 'dotenv/config'

import Mailer from '@/classes/Mailer'
import MiddleWare from '@/classes/Middleware'
import { ApiStatusCode, CustomErrorCode } from '@/types/Response'
import JWT from '@/utils/JWT'
import RandomName from '@/utils/RandomName'
import ResponseFormatter from '@/utils/ResponseFormatter'
import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'
import { v4 } from 'uuid'

const app = express.Router()
const prisma = new PrismaClient()

app.post('/login', async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) return res.status(400).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
  if (!Mailer.MailRegex.test(email)) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.INVALID_EMAIL)).end()

  // 이용자가 존재하지 않을경우 uuid를 생성하여 새로운 이용자를 생성 (uuid 중복 방지를 위한 do-while문 사용)
  let user = await prisma.user.findFirst({ where: { email } })
  if (!user) {
    let uuid
    do {
      uuid = v4()
    } while (await prisma.user.findFirst({ where: { uuid } }))
    user = await prisma.user.create({ data: { email, uuid, name: RandomName() } })
  }

  if (user.banned) return res.status(ApiStatusCode.FORBIDDEN).send(ResponseFormatter.error(CustomErrorCode.TEMPARAY_DISABLE)).end()

  // 6자리 인증코드 생성
  const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  Mailer.sendCode(email, code)

  const expiredAt = new Date(Date.now() + 1000 * 60 * 5)
  await prisma.authCode.create({ data: { code, expiredAt, userId: user.id } })

  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({ validtime: expiredAt })).end()
})

app.post('/code', async (req: Request, res: Response) => {
  const { code } = req.body
  const deviceID = req.headers['x-device-id']
  const platform = req.headers['x-device']

  if (!code) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
  const dbcode = await prisma.authCode.findFirst({ where: { code }, include: { User: true } })
  if (!dbcode) return res.status(ApiStatusCode.UNAUTHORIZED).send(ResponseFormatter.error(CustomErrorCode.INVALID_AUTH_CODE)).end()
  if (dbcode.expiredAt < new Date()) return res.status(ApiStatusCode.UNAUTHORIZED).send(ResponseFormatter.error(CustomErrorCode.AUTH_CODE_EXPIRED)).end()

  const token = JWT.sign(dbcode.User.id)
  if (dbcode.userId !== 9999) await prisma.authCode.delete({ where: { id: dbcode.id } })
  await prisma.tokens.create({
    data: {
      token,
      device: String(deviceID),
      platform: String(platform),
      expiredAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 14),
      User: { connect: { id: dbcode.User.id } }
    }
  })
  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({ token })).end()
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
  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(payload)).end()
})

app.post('/account', async (req: Request, res: Response) => {
  const { number, bank, holder } = req.body
  if (!number || !bank || !holder) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
  try {
    await prisma.bankAccount.deleteMany({ where: { userId: res.locals.user.id } })
    await prisma.user.update({ where: { id: res.locals.user.id }, data: { bankaccount: { create: { account: number, bankName: bank, holder } } } })
    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({})).end()
  } catch (error) {
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
})

app.get('/logout', async (req: Request, res: Response) => {
  const token = req.headers.authorization
  if (!token) return res.status(ApiStatusCode.UNAUTHORIZED).send(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()

  const status = await prisma.tokens.deleteMany({ where: { token } })
  if (!status) return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()

  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({})).end()
})

app.post('/logout', async (req: Request, res: Response) => {
  const { token } = req.body
  if (!token) return res.status(ApiStatusCode.UNAUTHORIZED).send(ResponseFormatter.error(CustomErrorCode.UNAUTHORIZED_TOKEN)).end()
  const permissionCheck = await prisma.tokens.findFirst({ where: { token } })

  if (!permissionCheck) return res.status(ApiStatusCode.FORBIDDEN).send(ResponseFormatter.error(CustomErrorCode.NO_PERMISSION)).end
  if (res.locals.user.id !== permissionCheck.userId) {
    return res.status(ApiStatusCode.FORBIDDEN).send(ResponseFormatter.error(CustomErrorCode.NO_PERMISSION)).end()
  }

  const status = await prisma.tokens.deleteMany({ where: { token } })
  if (!status) return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()

  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({})).end()
})

app.get('/mydevice', async (req: Request, res: Response) => {
  const tokens = await prisma.tokens.findMany({ where: { userId: res.locals.user.id } })
  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(tokens)).end()
})

// 이용자의 디바이스 푸시 토큰을 저장
app.post('/notification', async (req: Request, res: Response) => {
  const { token } = req.body
  const authToken = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

  await prisma.tokens.updateMany({ where: { token: authToken }, data: { deviceToken: token } })
})

export default app
