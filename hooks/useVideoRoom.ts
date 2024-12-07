import { useState } from 'react'
import { VideoRoom } from '@/types/shared'

export function useVideoRoom() {
  const [token, setToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createVideoRoom = async (x: number, y: number): Promise<VideoRoom> => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create Huddle01 room
      const roomRes = await fetch('/api/huddle/room', {
        method: 'POST'
      })
      const roomData = await roomRes.json()
      console.log('Room creation response:', roomData) // Debug log

      if (!roomRes.ok || !roomData.roomId) {
        throw new Error(roomData.error || 'Failed to create room')
      }

      // Get access token
      const tokenRes = await fetch(`/api/huddle/token?roomId=${roomData.roomId}`)
      const tokenData = await tokenRes.json()
      console.log('Token response:', tokenData) // Debug log

      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(tokenData.error || 'Failed to get access token')
      }

      setToken(tokenData.token)

      // Return room data
      return {
        id: `video-${roomData.roomId}`,
        type: 'video',
        name: 'Video Room',
        huddleRoomId: roomData.roomId,
        x,
        y,
        width: 400,
        height: 300
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create video room'
      console.error('Video room error:', err) // Debug log
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const joinVideoRoom = async (roomId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/huddle/token?roomId=${roomId}`)
      const data = await res.json()
      console.log('Join room response:', data) // Debug log

      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Failed to get access token')
      }

      setToken(data.token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join video room'
      console.error('Join room error:', err) // Debug log
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    token,
    isLoading,
    error,
    createVideoRoom,
    joinVideoRoom
  }
} 