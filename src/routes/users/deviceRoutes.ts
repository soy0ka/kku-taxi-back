// root: /users/devices
import { getCurrentUserDevice, updateCurrentUserDevice } from '@/controllers/userController'
import authMiddleware from '@/middlewares/auth'
import methodNotAllowedHandler from '@/middlewares/methodNotAllowed'
import { Router } from 'express'

const router = Router()

router.use(authMiddleware)
router.get('/', getCurrentUserDevice)
// router.post('/') // save user devices
// router.patch('/', updateCurrentUserDevice) // update user devices
router.delete('/') // delete user devices

router.patch('/', updateCurrentUserDevice)

router.use('/', methodNotAllowedHandler)

export default router
