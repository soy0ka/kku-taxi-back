import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import logMiddleware from './middlewares/logging'
import notFoundHandler from './middlewares/notfound'
import router from './routes'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logMiddleware)
app.use(router)
app.use(notFoundHandler)

export default app
