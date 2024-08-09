import authRoutes from '@/routes/auth.routes'
import chatRoutes from '@/routes/chat.routes'
import { Router } from 'express'
// import noticeRoutes from './modules/notice/noticeRoutes'
import partyRoutes from '@/routes/party.routes'
import userRoutes from '@/routes/user.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/chat', chatRoutes)
// router.use('/notice', noticeRoutes)
router.use('/party', partyRoutes)

export default router
