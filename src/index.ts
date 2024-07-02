import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import { createServer } from 'http'
import { Socket } from 'socket.io'
import Notification from './classes/PushNotification'
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
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket: Socket) => {
  Logger.info('WebSocket Server').put('Connected')
    .next('id').put(socket.id)
    .next('ip').put(socket.handshake.address)
    .next('user-agent').put(socket.handshake.headers['user-agent'])
    .out()
  socket.on('joinRoom', (room: string) => {
    socket.join(room)
    Logger.log('ChatManager').put('A user joined').next('id').put(socket.id).next('room').put(room).out()
  })

  socket.on('messageCreate', async (message) => {
    const dbMessage = await prisma.message.create({
      data: {
        content: message.content,
        senderId: message.senderId,
        chatRoomId: Number(message.roomId)
      }
    })
    const sender = {
      id: message.sender.id,
      name: message.sender.name,
      textId: message.sender.textId
    }
    io.to(message.roomId).emit('messageCreate', { ...dbMessage, sender })
    for (const user of message.roomUsers) {
      if (user.id === message.senderId) continue
      const token = await prisma.tokens.findFirst({ where: { userId: user.id } })
      if (!token?.deviceToken) continue
      Notification.send(token?.deviceToken, '메시지가 도착했습니다', message.content)
    }
    Logger.log('ChatManager').put('Message sent').next('id').put(socket.id).next('room').put(message.roomId).next('message').put(message.content).out()
  })

  socket.on('disconnect', () => {
    Logger.info('ChatManager').put('A user disconnected').next('id').put(socket.id).out()
  })
})

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
