import { getCurrentUserOrById } from '@/controllers/userController'
import authMiddleware from '@/middlewares/auth'
import deviceRouter from '@/routes/users/deviceRoutes'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/:idOrMe', getCurrentUserOrById)
router.use('/@me/devices', deviceRouter)

export default router
