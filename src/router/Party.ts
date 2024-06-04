import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import MiddleWare from '../classes/Middleware'
import Formatter from '../classes/ResponseFormat'
import express, { Request, Response } from 'express'
import generate from '../classes/RandomName'

const app = express.Router()
const prisma = new PrismaClient()

app.use(MiddleWare.auth)
app.post('/create', async (req: Request, res: Response) => {
  const { description, dateTime, departure, arrival, maxSize } = req.body
  if (!description || !dateTime || !departure || !arrival || !maxSize) return res.status(400).send(Formatter.format(false, 'Missing required fields')).end()
  const date = new Date(dateTime)
  if (date < new Date()) return res.status(400).send(Formatter.format(false, 'Invalid date')).end()
  const name = generate()
  try {
    await prisma.party.create({
      data: {
        name: `${name} 택시팟`,
        description,
        departure: date,
        maxSize,
        chatRoom: { create: { name: `${name} 채팅방` } },
        fromPlace: { connect: { id: departure } },
        toPlace: { connect: { id: arrival } },
        owner: { connect: { id: res.locals.user.id } }
      }
    })
    return res.status(200).send(Formatter.format(true, 'OK')).end()
  } catch (e) {
    console.error(e)
    return res.status(500).send(Formatter.format(false, 'Internal server error')).end()
  }
})

export default app
