import { checkMembership, findChatRoomById, getChatRoomsByUserId, getMessagesByRoomId } from '@/models/chatModel'

export const getChatroomListByUserId = async (userId: number) => {
  return getChatRoomsByUserId(userId)
}

export const getChatroomMessages = async (chatroomId: number) => {
  return getMessagesByRoomId(chatroomId)
}

export const checkChatroomMembership = async (userId: number, chatroomId: number) => {
  return checkMembership(userId, chatroomId)
}

export const getChatroomDetails = async (chatroomId: number) => {
  return findChatRoomById(chatroomId)
}
