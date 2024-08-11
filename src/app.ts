import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import errorHandler from './middlewares/errorHandler'
import heartbeat from './middlewares/heartbeat'
import logMiddleware from './middlewares/logging'
import notFoundHandler from './middlewares/notfound'
import router from './routes'

const app = express()

app.use(
  cors(),
  helmet(),
  express.json(),
  express.urlencoded({ extended: true }),
  logMiddleware
)
app.use(router)
app.use('/', heartbeat)
app.use(
  errorHandler,
  notFoundHandler
)

export default app
