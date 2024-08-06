import { login, verifyAuthCode } from '@/controllers/authController'
import { Router } from 'express'

const router = Router()

router.post('/login', login)
router.post('/code', verifyAuthCode)

export default router
