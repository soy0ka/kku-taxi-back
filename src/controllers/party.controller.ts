import { createNewParty, getParties, joinParty } from '@/services/party.service'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { Request, Response } from 'express'

// GET /party
export const getPartiesController = async (req: Request, res: Response) => {
  try {
    const { direction, page = '1', size = '10' } = req.query
    const pageNumber = parseInt(page as string, 10) || 1
    const pageSize = parseInt(size as string, 10) || 10

    if (!direction) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

    const result = await getParties(direction as string, pageNumber, pageSize)

    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(result)).end()
  } catch (error: any) {
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
}

// POST /party
export const creatPartyController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id
    const { description, dateTime, departure, arrival, maxSize } = req.body

    if (!description || !dateTime || !departure || !arrival || !maxSize) {
      return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()
    }

    const result = await createNewParty({
      userId,
      description,
      dateTime,
      departure,
      arrival,
      maxSize
    })

    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(result)).end()
  } catch (error: any) {
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
}

// POST /party/:id/pay
export const payForPartyController = async (req: Request, res: Response) => {
  try {
    // const userId = res.locals.user.id
    // const { partyId, price, totalPrice } = req.body
    // const result = await payForParty(userId, partyId, price, totalPrice)
    // return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error: any) {
    return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(error.message)).end()
  }
}

// POST /party/:id/join
export const joinPartyController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id
    const { id } = req.params
    if (!id) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

    const result = await joinParty(userId, parseInt(id))
    return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error: any) {
    return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(error.message)).end()
  }
}

// GET /party/:id
export const getPartyChatController = async (req: Request, res: Response) => {
  try {
    // const { id } = req.params
    // if (!id) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

    // const result = await getPartyChat(parseInt(id, 10))
    // return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error) {
    return res.status(ApiStatusCode.INTERNAL_SERVER_ERROR).send(ResponseFormatter.error(CustomErrorCode.DATABASE_ERROR)).end()
  }
}
