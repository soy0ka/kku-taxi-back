import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import appCheck from './middlewares/appCheck'
import errorHandler from './middlewares/errorHandler'
import logMiddleware from './middlewares/logging'
import notFoundHandler from './middlewares/notfound'
import router from './routes'

const app = express()

app.use(
  cors(),
  helmet(),
  express.json(),
  express.urlencoded({ extended: true }),
  logMiddleware,
  appCheck
)
app.use(router)
app.use(
  errorHandler,
  notFoundHandler
)

export default app
