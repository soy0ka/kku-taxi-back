import { ApiStatusCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({ message: '베타 서비스입니다 다소 불안정 할 수 있습니다' })).end()
})

export default router
