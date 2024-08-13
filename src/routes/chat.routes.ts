// root: /chats
import { getChatroomDetailsById, getCurrentUserChatOrById, getMessagesByChatroomId, reportMessage } from '@/controllers/chat.controller'
import authMiddleware from '@/middlewares/auth'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/:idOrMe', getCurrentUserChatOrById) // 채팅방 목록 조회
router.get('/:id/details', getChatroomDetailsById) // 채팅방 상세 조회
router.get('/:id/messages', getMessagesByChatroomId) // 채팅 메세지 조회
router.post('/:id/messages') // 채팅 메세지 전송
router.post('/:id/reports', reportMessage) // 채팅 신고

export default router
