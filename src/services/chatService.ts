import { getChatRoomsByUserId } from '@/models/chatModel'

export const getChatroomListByUserId = async (userId: number) => {
  return getChatRoomsByUserId(userId)
}
