import authRoutes from '@/routes/authRoutes'
import { Router } from 'express'
// import chatRoutes from './modules/chat/chatRoutes'
// import noticeRoutes from './modules/notice/noticeRoutes'
// import partyRoutes from './modules/party/partyRoutes'

const router = Router()

router.use('/auth', authRoutes)
// router.use('/chat', chatRoutes)
// router.use('/notice', noticeRoutes)
// router.use('/party', partyRoutes)

export default router
