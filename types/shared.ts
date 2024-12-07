export interface BaseRoom {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  type: 'event' | 'social' | 'sponsor' | 'workshop' | 'video' | 'chat'
  theme?: {
    color: string
  }
}

export interface ChatRoom extends BaseRoom {
  type: 'chat'
  messages: Message[]
}

export interface VideoRoom extends BaseRoom {
  type: 'video'
  huddleRoomId: string
}

export interface EventRoom extends BaseRoom {
  type: 'event'
  huddleRoomId?: string
}

export interface SocialRoom extends BaseRoom {
  type: 'social'
}

export interface SponsorRoom extends BaseRoom {
  type: 'sponsor'
}

export interface WorkshopRoom extends BaseRoom {
  type: 'workshop'
}

export type Room = ChatRoom | VideoRoom | EventRoom | SocialRoom | SponsorRoom | WorkshopRoom

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: number
}

export interface User {
  address: string
  name: string
  x: number
  y: number
} 