import { creatPartyController, getPartiesController, getPartyChatController, getPartyMembersController, joinPartyController, payForPartyController } from '@/controllers/party.controller'
import authMiddleware from '@/middlewares/auth'
import notFoundHandler from '@/middlewares/notfound'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/', getPartiesController) // 파티 목록 조회
router.post('/', creatPartyController) // 파티 생성

router.get('/:id', getPartyChatController) // 파티 조회 (기능 확장 예정)
router.delete('/:id', notFoundHandler) // 파티 삭제 - 미완성

router.get('/:id/membsers', getPartyMembersController) // 파티 멤버 조회

router.post('/:id/join', joinPartyController) // 파티 참가
router.post('/:id/pay', payForPartyController) // 파티 결제
// router.delete('/:id/leave') // 파티 탈퇴

export default router
