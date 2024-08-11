import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const findBankAccountByUserId = async (userId: number) => {
  return prisma.bankAccount.findFirst({ where: { userId } })
}

export const createBankAccount = async (data: Prisma.BankAccountUncheckedCreateInput) => {
  return prisma.bankAccount.create({ data })
}

export const updateBankAccount = async (userId: number, data: Prisma.BankAccountUncheckedUpdateManyInput) => {
  return prisma.bankAccount.updateMany({ where: { userId }, data })
}
