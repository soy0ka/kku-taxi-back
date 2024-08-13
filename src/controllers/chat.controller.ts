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
      return res.status(ApiStatusCode.SUCCESS).send(responseFormatter.success(chatrooms)).end()
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
