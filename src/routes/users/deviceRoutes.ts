// root: /users/devices
import authMiddleware from '@/middlewares/auth'
import methodNotAllowedHandler from '@/middlewares/methodNotAllowed'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/') // get user devices
router.post('/') // save user devices
router.patch('/') // update user devices
router.delete('/') // delete user devices
router.use('/', methodNotAllowedHandler)

export default router
