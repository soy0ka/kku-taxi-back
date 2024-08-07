import authRoutes from '@/routes/authRoutes'
import { Router } from 'express'
import chatRoutes from './routes/chatRoutes'
// import noticeRoutes from './modules/notice/noticeRoutes'
import partyRoutes from '@/routes/partyRoutes'
import userRoutes from '@/routes/userRoutes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/chat', chatRoutes)
// router.use('/notice', noticeRoutes)
router.use('/party', partyRoutes)

export default router
