import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createFeedback = async (to: number, from: number, content: Prisma.FeedBackCreateInput['content']) => {
  return prisma.feedBack.create({
    data: {
      reportUserId: from,
      targetId: to,
      content
    }
  })
}

export const getCountofFeedback = async (userId: number) => {
  return prisma.feedBack.count({ where: { targetId: userId } })
}
