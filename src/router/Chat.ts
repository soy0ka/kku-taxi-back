import 'dotenv/config'

import MiddleWare from '@/classes/Middleware'
import { ApiStatusCode, CustomErrorCode } from '@/types/Response'
import ResponseFormatter from '@/utils/ResponseFormatter'
import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'

const app = express.Router()
const prisma = new PrismaClient()

app.use(MiddleWare.auth)
app.get('/me', async (req: Request, res: Response) => {
  const myChatRooms = await prisma.chatRoom.findMany({
    select: {
      id: true,
      name: true,
      Party: true
    },
    where: {
      users: { some: { id: res.locals.user.id } }, // 내가 속한 채팅방중
      NOT: { isdeleted: true } // 삭제되지 않은 채팅방
    }
  })

  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(myChatRooms)).end()
})

// 채팅방 정보 가져오기
app.get('/room/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  if (!id) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

  const chatRoom = await prisma.message.findMany({
    select: {
      id: true,
      content: true,
      createdAt: true,
      isdeleted: true,
      isSystem: true,
      sender: true
    },
    where: {
      chatRoomId: Number(id),
      NOT: { isdeleted: true }
    }
  })

  if (!chatRoom) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.CHATROOM_NOT_FOUND)).end()
  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(chatRoom)).end()
})

// 메시지 전송
app.post('/room/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { content } = req.body
  if (!id || !content) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

  await prisma.message.create({ data: { chatRoomId: Number(id), content: req.body.content, senderId: res.locals.user.id } })
  return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({})).end()
})

app.post('/report', async (req: Request, res: Response) => {
  const { id, reason } = req.body
  if (!id || !reason) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
  const message = await prisma.message.findUnique({ where: { id: Number(id) } })
  if (!message) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.CHATROOM_NOT_FOUND)).end()

  await prisma.chatReportLog.create({
    data: {
      reason,
      chatRoomId: message.chatRoomId,
      content: message.content,
      userId: res.locals.user.id
    }
  })
})

export default app
