import { getCurrentUserOrById, registerBankAccount } from '@/controllers/user.controller'
import authMiddleware from '@/middlewares/auth'
import deviceRouter from '@/routes/users/deviceRoutes'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/:idOrMe', getCurrentUserOrById)
router.post('/:idOrMe/bankaccount', registerBankAccount)
router.use('/@me/devices', deviceRouter)

export default router
