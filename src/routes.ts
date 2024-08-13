import authRoutes from '@/routes/auth.routes'
import chatRoutes from '@/routes/chat.routes'
import noticeRoutes from '@/routes/notice.routes'
import partyRoutes from '@/routes/party.routes'
import userRoutes from '@/routes/user.routes'
import { Router } from 'express'

const router = Router()

router.use('/notice', noticeRoutes)
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/chat', chatRoutes)
// router.use('/notice', noticeRoutes)
router.use('/party', partyRoutes)

export default router
