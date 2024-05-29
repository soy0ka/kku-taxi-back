import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Logger } from './utils/Logger'
import { PrismaClient } from '@prisma/client'
import express, { Request, Response, NextFunction } from 'express'

import Auth from './router/Auth'
import Chat from './router/Chat'
import Notice from './router/Notice'
import SocketIO, { Socket } from 'socket.io'
import MiddleWare from './classes/Middleware'

const app = express()
const server = createServer(app)
const prisma = new PrismaClient()
const io = new SocketIO.Server(server)

const port = process.env.PORT || 3000

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('*', MiddleWare.log)
app.use('/auth', Auth)
app.use('/chat', Chat)
app.use('/notice', Notice)
app.use('/session', async (req: Request, res: Response) => { return res.status(200).send({ code: 200, message: 'OK' }).end() })
app.use('*', async (req: Request, res: Response, next: NextFunction) => { res.status(404).send({ code: 404, message: 'Not Found' }) })

io.on('connection', (socket: Socket) => {
  Logger.info('ChatManager').put('A user connected')

  socket.on('join', (room: string) => {
    socket.join(room)
    Logger.log('ChatManager').put('A user joined').next('room').put(room)
  })

  socket.on('message', (room: string, message: string) => {
    io.to(room).emit('message', message)
    Logger.log('ChatManager').put('Message sent').next('room').put(room).next('message').put(message)
  })

  socket.on('disconnect', () => {
    Logger.info('ChatManager').put('A user disconnected')
  })
})

server.listen(port, () => {
  const env = process.env.ENVIRONMENT || 'development'
  Logger.info('Environment').put(env).out()
  Logger.success('Express').put('Server Ready').next('port').put(port).out()
  switch (env) {
    case 'ci':
      Logger.warning('Environment').put('CI deteced process will be stop instanlty').out()
      process.exit(0)
  }
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
