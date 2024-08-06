import authMiddleware from '@/middlewares/auth'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/') // 파티 목록 조회
router.post('/') // 파티 생성

router.get('/:id') // 파티 상세 조회
router.delete('/:id') // 파티 삭제

router.post('/:id/join') // 파티 참가
router.post('/:id/pay') // 파티 결제 요청
// router.delete('/:id/leave') // 파티 탈퇴

export default router
