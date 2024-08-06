import { getCurrentUser, login, verifyAuthCode } from '@/controllers/authController'
import authMiddleware from '@/middlewares/auth'
import { Router } from 'express'

const router = Router()

router.post('/login', login)
router.post('/code', verifyAuthCode)

router.use(authMiddleware)
router.get('/me', getCurrentUser)
// router.put('/account', updateAccount)
// router.post('/logout', logout)
// router.get('/devices', getDevices)
// router.post('/notifications', saveNotificationToken)

export default router
