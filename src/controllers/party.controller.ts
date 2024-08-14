import { createNewParty, finishParty, getParties, getPartyMembers, joinParty, payForParty } from '@/services/party.service'
import { ApiStatusCode, CustomErrorCode } from '@/types/response'
import ResponseFormatter from '@/utils/formatter/response'
import { NextFunction, Request, Response } from 'express'

// GET /party
export const getPartiesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { direction, page = '1', size = '10' } = req.query
    const pageNumber = parseInt(page as string, 10) || 1
    const pageSize = parseInt(size as string, 10) || 10

    if (!direction) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

    const result = await getParties(direction as string, pageNumber, pageSize)

    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(result)).end()
  } catch (error) {
    next(error)
  }
}

// POST /party
export const creatPartyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals.user.id
    const { description, dateTime, departure, arrival, maxSize } = req.body

    if (!description || !dateTime || !departure || !arrival || !maxSize) {
      throw new Error(CustomErrorCode.REQUIRED_FIELD)
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
  } catch (error) {
    next(error)
  }
}

// POST /party/:id/pay
export const payForPartyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = res.locals.user.id
    const { price, totalPrice } = req.body
    if (!id || isNaN(parseInt(id))) throw new Error(CustomErrorCode.REQUIRED_FIELD)
    if (!price || !totalPrice) throw new Error(CustomErrorCode.REQUIRED_FIELD)

    const result = await payForParty(userId, parseInt(id), price, totalPrice)
    return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error) {
    next(error)
  }
}

// POST /party/:id/join
export const joinPartyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = res.locals.user
    const { id } = req.params
    if (!id) throw new Error(CustomErrorCode.REQUIRED_FIELD)

    const chatRoomId = await joinParty(user, parseInt(id))
    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({ chatRoomId })).end()
  } catch (error) {
    next(error)
  }
}

// GET /party/:id
export const getPartyChatController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const { id } = req.params
    // if (!id) return res.status(ApiStatusCode.BAD_REQUEST).send(ResponseFormatter.error(CustomErrorCode.REQUIRED_FIELD)).end()

    // const result = await getPartyChat(parseInt(id, 10))
    // return res.status(ApiStatusCode.SUCCESS).send(result).end()
  } catch (error) {
    next(error)
  }
}

// GET /party/:id/members
export const getPartyMembersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    if (!id) throw new Error(CustomErrorCode.REQUIRED_FIELD)
    if (isNaN(parseInt(id))) throw new Error(CustomErrorCode.INVALID_FIELD)

    const result = await getPartyMembers(parseInt(id, 10))
    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success(result)).end()
  } catch (error) {
    next(error)
  }
}

// POST /party/:id/finish
export const finishPartyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = res.locals.user.id
    const { feedBack } = req.body
    if (!id || !feedBack) throw new Error(CustomErrorCode.REQUIRED_FIELD)
    if (isNaN(parseInt(id))) throw new Error(CustomErrorCode.INVALID_FIELD)

    await finishParty(parseInt(id), userId, feedBack)

    return res.status(ApiStatusCode.SUCCESS).send(ResponseFormatter.success({})).end()
  } catch (error) {
    next(error)
  }
}
