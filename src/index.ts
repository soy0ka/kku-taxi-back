import 'dotenv/config'

import http from 'http'
import app from './app'
import { initializeSocketServer } from './sockets'
import { Logger } from './utils/logging/logger'

const port = process.env.PORT || 3000
const server = http.createServer(app)

Logger.initialize('./')
initializeSocketServer(server)

server.listen(port, () => {
  Logger.success('Express').put('Server Ready').next('port').put(port).out()
})
