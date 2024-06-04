import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import MiddleWare from '../classes/Middleware'
import Formatter from '../classes/ResponseFormat'
import express, { Request, Response } from 'express'

const app = express.Router()
const prisma = new PrismaClient()

app.use(MiddleWare.auth)
app.get('/me', async (req: Request, res: Response) => {
  const myChatRooms = await prisma.chatRoom.findMany({ where: { users: { some: { id: res.locals.user.id } }, NOT: { isdeleted: true } } })
  const FormattedChatroom = []
  for (const chatRoom of myChatRooms) {
    const party = await prisma.party.findFirst({ where: { chatRoomId: chatRoom.id } })
    if (!party) continue
    FormattedChatroom.push({
      id: chatRoom.id,
      name: chatRoom.name,
      party: { ...party, from: await prisma.place.findUnique({ where: { id: party.fromPlaceId } }), to: await prisma.place.findUnique({ where: { id: party.toPlaceId } }) }
    })
  }
  return res.status(200).send(Formatter.format(true, 'OK', FormattedChatroom)).end()
})

app.get('/room/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  if (!id) return res.status(400).send(Formatter.format(false, 'Chat room ID is required')).end()

  const chatRoom = await prisma.message.findMany({ where: { chatRoomId: Number(id), NOT: { isdeleted: true } } })
  if (!chatRoom) return res.status(404).send(Formatter.format(false, 'Chat room not found')).end()
  const chatRoomWithSender = []
  for (const message of chatRoom) {
    const sender = await prisma.user.findUnique({ where: { id: message.senderId }, select: { id: true, name: true } })
    chatRoomWithSender.push({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      isdeleted: message.isdeleted,
      sender
    })
  }

  return res.status(200).send(Formatter.format(true, 'OK', chatRoomWithSender)).end()
})

app.post('/room/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { content } = req.body
  if (!content) return res.status(400).send(Formatter.format(false, 'Message content is required')).end()
  if (!id) return res.status(400).send(Formatter.format(false, 'Chat room ID is required')).end()

  await prisma.message.create({ data: { chatRoomId: Number(id), content: req.body.content, senderId: res.locals.user.id } })
  return res.status(200).send(Formatter.format(true, 'OK')).end()
})

export default app
