import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import { Logger } from './utils/Logger'
import { PrismaClient } from '@prisma/client'
import express, { Request, Response, NextFunction } from 'express'

import Auth from './router/Auth'
// import MiddleWare from './classes/Middleware'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('*', async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const userAgent = req.headers['user-agent']
  res.locals.ip = ip
  Logger.log(req.method).put(req.params?.['0'])
    .next('ip').put(ip)
    .next('user-agent').put(userAgent)
    .next('DeviceID').put(req.headers['x-device-id'])
    .next('Platform').put(req.headers['x-platform'])
    .out()
  next()
})

app.use('/auth', Auth)

app.use('/session', async (req: Request, res: Response) => {
  return res.status(200).send({ code: 200, message: 'OK' }).end()
})

app.use('*', async (req: Request, res: Response, next: NextFunction) => {
  res.status(404).send({ code: 404, message: 'Not Found' })
})

app.listen(process.env.PORT, () => {
  Logger.success('Express').put('Server Ready').next('port').put(process.env.PORT).out()
  Logger.info('Environment').put(String(process.env.ENVIRONMENT)).out()
  switch (process.env.ENVIRONMENT) {
    case 'ci':
      Logger.warning('Environment').put('CI deteced process will be stop instanlty').out()
      process.exit(0)
  }
})

// 주기적인 authcode 삭제
setInterval(async () => {
  Logger.log('AuthCodeCleaner').put('Cleaning Started').out()
  await prisma.authCode.deleteMany({
    where: {
      expiredAt: {
        lte: new Date()
      }
    }
  })
  Logger.log('AuthCodeCleaner').put('Cleaning Finished').out()
}, 1000 * 60 * 60 * 24)

process.on('uncaughtException', e => {
  Logger.error('Unhandled Exception').put(e.stack).out()
})
process.on('unhandledRejection', e => {
  Logger.error('Unhandled Rejection').put(e instanceof Error ? e.stack : e).out()
})
