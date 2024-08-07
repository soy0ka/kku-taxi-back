import 'dotenv/config'

import { Logger } from '@/utils/logging/logger'
import jwt, { JwtPayload } from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'secret'

const sign = (id: number) => {
  const payload = { sub: id }
  return jwt.sign(payload, SECRET, {
    algorithm: 'HS256',
    expiresIn: '30d',
    issuer: 'KKUTAXI'
  })
}

const verify = (token: string) => {
  try {
    const decoded: String | JwtPayload = jwt.verify(token, SECRET)
    return { ok: true, id: decoded.sub }
  } catch (error: any) {
    Logger.error('JWT verify error').put(error).out()
    return { ok: false, message: error.message }
  }
}

export default { sign, verify }
