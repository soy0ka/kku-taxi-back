import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const findBankAccountByUserId = async (userId: number) => {
  return prisma.bankAccount.findFirst({ where: { userId } })
}
