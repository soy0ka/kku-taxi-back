import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createAuthCode = async (userId: number) => {
  const expiredAt = new Date(Date.now() + 1000 * 60 * 5)
  let code
  do {
    code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  } while (await getAuthCode(code))

  const authCode = await prisma.authCode.create({ data: { code, expiredAt, userId } })
  return authCode
}

export const getAuthCode = async (code: string) => {
  return prisma.authCode.findFirst({
    where: { code },
    include: { User: true }
  })
}

export const deleteAuthCode = async (id: number) => {
  return prisma.authCode.delete({ where: { id } })
}
