import { getCurrentUser } from '@/controllers/usersController'
import authMiddleware from '@/middlewares/auth'
import deviceRouter from '@/routes/users/deviceRoutes'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/me', getCurrentUser)
router.use('/me/devices', deviceRouter)
router.post('/me/notifications') // save notification token

export default router
