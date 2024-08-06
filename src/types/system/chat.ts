export interface Message {
  content: string
  senderId: number
  roomId: number
  isSystem?: boolean
  sender: {
    id: number
    name: string
    textId: string
    profileImage: string
  }
  timestamp: Date
}
