// root: /chats
import authMiddleware from '@/middlewares/auth'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/') // 채팅 목록 조회

router.get('/:id') // 채팅 상세 조회
router.post('/:id/messages') // 채팅 메세지 전송
router.post('/:id/reports') // 채팅 신고

export default router
