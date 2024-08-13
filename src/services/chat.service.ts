import { checkMembership, findChatRoomById, getChatRoomsByUserId } from '@/models/chat.model'
import { addReportLog, getMessage, getMessagesByRoomId } from '@/models/message.model'

export const getChatroomListByUserId = async (userId: number) => {
  return getChatRoomsByUserId(userId)
}

export const getChatroomMessages = async (chatroomId: number) => {
  return getMessagesByRoomId(chatroomId)
}

export const checkChatroomMembership = async (userId: number, chatroomId: number) => {
  return checkMembership(userId, chatroomId)
}

export const checkChatMessageAccess = async (userId: number, messageId: number) => {
  const message = await findMessageById(messageId)
  if (!message) return false

  return checkChatroomMembership(userId, message.chatRoomId)
}

export const getChatroomDetails = async (chatroomId: number) => {
  return findChatRoomById(chatroomId)
}

export const findMessageById = async (messageId: number) => {
  return getMessage(messageId)
}

export const reportMessageByMessage = async (userId: number, messageId: number, reason: string) => {
  const message = await findMessageById(messageId)
  if (!message) throw new Error('Message not found')

  return addReportLog(userId, message, reason)
}
