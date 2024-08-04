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
import { ApiStatusCode, CustomErrorCode } from './types/Response'
import ResponseFormatter from './utils/ResponseFormatter'

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
app.use('/session', async (req: Request, res: Response) => {
  res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({ message: 'OK' })).end()
})
app.use('*', async (req: Request, res: Response, next: NextFunction) => {
  res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.PAGE_NOT_FOUND)).end()
})
server.listen(port, () => {
  const env = process.env.ENVIRONMENT || 'development'
  Logger.info('Environment').put(env).out()
  Logger.success('Express').put('Server Ready').next('port').put(port).out()
})

// 주기적인 authcode 삭제
setInterval(async () => {
  Logger.log('Job').put('Autcode Cleaning Started').out()
  await prisma.authCode.deleteMany({ where: { expiredAt: { lte: new Date() } } })
  Logger.log('Job').put('Autcode Cleaning Finished').out()
}, 1000 * 60 * 60)

setInterval(async () => {
  Logger.log('Job').put('Token Cleaning Started').out()

  // 각 기기별로 가장 최근 토큰을 찾음
  const recentTokens = await prisma.tokens.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    distinct: ['device'],
    select: {
      id: true
    }
  })
  const recentTokenIds = recentTokens.map(token => token.id)

  // 가장 최근 토큰을 제외한 모든 토큰을 찾음
  const tokensToDelete = await prisma.tokens.findMany({
    where: {
      id: {
        notIn: recentTokenIds
      }
    },
    select: {
      id: true
    }
  })

  const tokenIdsToDelete = tokensToDelete.map(token => token.id)
  await prisma.tokens.deleteMany({
    where: {
      id: {
        in: tokenIdsToDelete
      }
    }
  })
}, 1000 * 60 * 60)

process.on('uncaughtException', e => {
  Logger.error('Unhandled Exception').put(e.stack).out()
})
process.on('unhandledRejection', e => {
  Logger.error('Unhandled Rejection').put(e instanceof Error ? e.stack : e).out()
})
