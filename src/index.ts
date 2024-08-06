import 'dotenv/config'

import http from 'http'
import app from './app'
import { initializeSocketServer } from './sockets'
import { registerChatHandlers } from './sockets/chatWebSocket'
import { Logger } from './utils/logging/logger'

const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = initializeSocketServer(server)

Logger.initialize('./')
registerChatHandlers(io)

server.listen(port, () => {
  Logger.success('Express').put('Server Ready').next('port').put(port).out()
})
