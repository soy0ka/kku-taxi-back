export interface Sender {
  id: number
  name: string
  textId: string
  profileImage: string
}

export interface Message {
  content: string
  senderId: number
  roomId: number
  isSystem?: boolean // Default is false
  sender: Sender
  timestamp: Date
}
