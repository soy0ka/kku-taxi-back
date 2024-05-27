import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import { Logger } from './utils/Logger'
import express, { Request, Response, NextFunction } from 'express'

import Auth from './router/Auth'
import MiddleWare from './classes/Middleware'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('*', async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const userAgent = req.headers['user-agent']
  res.locals.ip = ip

  Logger.log(req.method).put(req.params?.['0']).next('ip').put(ip).next('user-agent').put(userAgent).out()
  next()
})

app.use(MiddleWare.verify)
app.use('/auth', Auth)

app.use('/session', async (req: Request, res: Response) => {
  return res.status(200).send({ code: 200, message: 'OK' }).end()
})

app.use('*', async (req: Request, res: Response, next: NextFunction) => {
  res.status(404).send({ code: 404, message: 'Not Found' })
})

app.listen(process.env.PORT, () => {
  Logger.success('Express').put('Server Ready').next('port').put(process.env.PORT).out()
  Logger.info('Environment').put(String(process.env.ENVIRONMENT)).out()
  switch (process.env.ENVIRONMENT) {
    case 'ci':
      Logger.warning('Environment').put('CI deteced process will be stop instanlty').out()
      process.exit(0)
  }
})

process.on('uncaughtException', e => {
  Logger.error('Unhandled Exception').put(e.stack).out()
})
process.on('unhandledRejection', e => {
  Logger.error('Unhandled Rejection').put(e instanceof Error ? e.stack : e).out()
})
