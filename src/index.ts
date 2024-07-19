import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import { createServer } from 'http'
import { initializeSocket } from './classes/ChatManager'
import { Logger } from './utils/Logger'

import MiddleWare from './classes/Middleware'
import Auth from './router/Auth'
import Chat from './router/Chat'
import Notice from './router/Notice'
import Party from './router/Party'

const app = express()
const prisma = new PrismaClient()
const port = process.env.PORT || 3000
const server = createServer(app)
initializeSocket(server)

Logger.initialize('./')
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('*', MiddleWare.log)
app.use('/auth', Auth)
app.use('/chat', Chat)
app.use('/notice', Notice)
app.use('/party', Party)
app.use('/session', async (req: Request, res: Response) => { return res.status(200).send({ code: 200, message: 'OK' }).end() })
app.use('*', async (req: Request, res: Response, next: NextFunction) => { res.status(404).send({ code: 404, message: 'Not Found' }) })

server.listen(port, () => {
  const env = process.env.ENVIRONMENT || 'development'
  Logger.info('Environment').put(env).out()
  Logger.success('Express').put('Server Ready').next('port').put(port).out()
})

// 주기적인 authcode 삭제
setInterval(async () => {
  Logger.log('AuthCodeCleaner').put('Cleaning Started').out()
  await prisma.authCode.deleteMany({ where: { expiredAt: { lte: new Date() } } })
  Logger.log('AuthCodeCleaner').put('Cleaning Finished').out()
}, 1000 * 60 * 60)

process.on('uncaughtException', e => {
  Logger.error('Unhandled Exception').put(e.stack).out()
})
process.on('unhandledRejection', e => {
  Logger.error('Unhandled Rejection').put(e instanceof Error ? e.stack : e).out()
})
