export type PushPriority = 'default' | 'normal' | 'high'

export interface BasePushPayload {
  to: string | string[]
  title: string
  body: string
  data?: Object
  ttl?: number
  expiration?: number // UNIX Timestamp
  priority?: PushPriority
  categoryId?: string
}

export interface AndroidPushPayload extends BasePushPayload {
  channelId: string
}

export interface IosPushPayload extends BasePushPayload {
  sound?: string
  subtitle?: string
  _contentAvailable?: Boolean
  badge?: number
  mutableContent?: Boolean // 알림의 수정가능 여부 (카카오톡 메세지 삭제같은 기능)
}
