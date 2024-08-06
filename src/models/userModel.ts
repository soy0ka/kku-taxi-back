import RandomName from '@/utils/RandomName'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } })
}

export const findUserById = async (id: number) => {
  return await prisma.user.findUnique({ where: { id } })
}

export const findUserByUuid = async (uuid: string) => {
  return await prisma.user.findUnique({ where: { uuid } })
}

export const createUser = async (email: string) => {
  let uuid
  do {
    uuid = uuidv4()
  } while (await findUserByUuid(uuid))

  const user = await prisma.user.create({ data: { email, uuid, name: RandomName() } })
  return user
}

export const saveToken = async (token: string, data: {
  userId: number
  deviceID: string
  platform: string
}) => {
  await prisma.tokens.create({
    data: {
      token,
      device: data.deviceID,
      platform: data.platform,
      expiredAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 14),
      User: { connect: { id: data.userId } }
    }
  })
}