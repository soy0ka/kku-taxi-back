import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import MiddleWare from '../classes/Middleware'
import Formatter from '../classes/ResponseFormat'
import express, { Request, Response } from 'express'

const app = express.Router()
const prisma = new PrismaClient()

app.use(MiddleWare.auth)
app.get('/me', async (req: Request, res: Response) => {
  const myChatRooms = await prisma.chatRoom.findMany({ where: { users: { some: { id: res.locals.user.id } } } })
  return res.status(200).send(Formatter.format(true, 'OK', myChatRooms)).end()
})

app.get('/room/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  if (!id) return res.status(400).send(Formatter.format(false, 'Chat room ID is required')).end()

  const chatRoom = await prisma.message.findMany({ where: { chatRoomId: Number(id) } })
  if (!chatRoom) return res.status(404).send(Formatter.format(false, 'Chat room not found')).end()

  return res.status(200).send(Formatter.format(true, 'OK', chatRoom)).end()
})

export default app
