// router.get('/:idOrMe') // 채팅 목록 조회
// router.get('/:id/messages') // 채팅 메세지 조회
// router.post('/:id/messages') // 채팅 메세지 전송
// router.post('/:id/reports') // 채팅 신고

import { CustomError } from '@/classes/CustomError'
import { checkChatroomMembership, getChatroomDetails, getChatroomListByUserId, getChatroomMessages } from '@/services/chat.service'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import responseFormatter from '@/utils/formatter/response'
import { NextFunction, Request, Response } from 'express'

// GET /chat/:idOrMe
export const getCurrentUserChatOrById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrMe } = req.params
    const user = res.locals.user
    if (!idOrMe) throw new CustomError(CustomErrorCode.REQUIRED_FIELD)

    if (idOrMe === '@me') {
      const chatrooms = await getChatroomListByUserId(user.id)
      return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success({ chatrooms })).end()
    } else {
      // 특정 사용자 채팅 목록 조회 (미구현)
      // getChatroomListByUserId(Number(idOrMe))
      throw new CustomError(CustomErrorCode.NO_PERMISSION)
    }
  } catch (error: any) {
    next(error)
  }
}

// GET /chat/:id/details
export const getChatroomDetailsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    if (!id) throw new CustomError(CustomErrorCode.REQUIRED_FIELD)

    const isMember = await checkChatroomMembership(res.locals.user.id, Number(id))
    if (!isMember) throw new CustomError(CustomErrorCode.NO_PERMISSION)

    const chatroom = await getChatroomDetails(Number(id))
    if (!chatroom) throw new CustomError(CustomErrorCode.CHATROOM_NOT_FOUND)

    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(chatroom)).end()
  } catch (error: any) {
    next(error)
  }
}

// GET /chat/:id/messages
export const getMessagesByChatroomId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    if (!id) throw new CustomError(CustomErrorCode.REQUIRED_FIELD)

    const isMember = await checkChatroomMembership(res.locals.user.id, Number(id))
    if (!isMember) throw new CustomError(CustomErrorCode.NO_PERMISSION)

    const messages = await getChatroomMessages(Number(id))
    return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(messages)).end()
  } catch (error: any) {
    next(error)
  }
}

// // 채팅방 정보 가져오기
// app.get('/room/:id', async (req: Request, res: Response) => {
//   const id = req.params.id
//   if (!id) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

//   const chatRoom = await prisma.message.findMany({
//     select: {
//       id: true,
//       content: true,
//       createdAt: true,
//       isdeleted: true,
//       isSystem: true,
//       sender: true
//     },
//     where: {
//       chatRoomId: Number(id),
//       NOT: { isdeleted: true }
//     }
//   })

//   if (!chatRoom) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.CHATROOM_NOT_FOUND)).end()
//   return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(chatRoom)).end()
// })

// // 메시지 전송
// app.post('/room/:id', async (req: Request, res: Response) => {
//   const { id } = req.params
//   const { content } = req.body
//   if (!id || !content) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

//   await prisma.message.create({ data: { chatRoomId: Number(id), content: req.body.content, senderId: res.locals.user.id } })
//   return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({})).end()
// })

// app.post('/report', async (req: Request, res: Response) => {
//   const { id, reason } = req.body
//   if (!id || !reason) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
//   const message = await prisma.message.findUnique({ where: { id: Number(id) } })
//   if (!message) return res.status(ApiStatusCode.NOT_FOUND).send(ResponseFormatter.error(CustomErrorCode.CHATROOM_NOT_FOUND)).end()

//   await prisma.chatReportLog.create({
//     data: {
//       reason,
//       chatRoomId: message.chatRoomId,
//       content: message.content,
//       userId: res.locals.user.id
//     }
//   })
// })

// export default app
