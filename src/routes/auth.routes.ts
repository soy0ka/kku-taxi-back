import { login, verifyAuthCode } from '@/controllers/auth.controller'
import { Router } from 'express'

const router = Router()

router.post('/login', login)
router.post('/code', verifyAuthCode)

export default router
