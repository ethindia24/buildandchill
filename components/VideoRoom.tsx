'use client'

import { useEffect, useRef, useState } from 'react'
import { 
  useLocalAudio,
  useLocalPeer,
  useLocalVideo,
  usePeerIds,
  useRoom,
  useRemoteVideo
} from '@huddle01/react/hooks'
import { IoMicOff, IoMic, IoVideocam, IoVideocamOff, IoClose } from 'react-icons/io5'

interface VideoRoomProps {
  roomId: string
  token: string
  onClose: () => void
}

export default function VideoRoom({ roomId, token, onClose }: VideoRoomProps) {
  const [displayName, setDisplayName] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { joinRoom, state, leaveRoom } = useRoom({
    onJoin: (room) => {
      console.log('Joined room:', room)
      updateMetadata({ displayName })
      setIsJoining(false)
      setShowJoinForm(false)
    },
    onLeave: () => {
      console.log('Left room')
      setShowJoinForm(true)
    }
  })

  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo()
  const { enableAudio, isAudioOn, disableAudio } = useLocalAudio()
  const { updateMetadata } = useLocalPeer()
  const { peerIds } = usePeerIds()

  // Handle video stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [stream])

  const handleJoinRoom = async () => {
    if (!displayName.trim()) return
    
    try {
      setIsJoining(true)
      await joinRoom({ roomId, token })
    } catch (error) {
      console.error('Failed to join room:', error)
      setIsJoining(false)
    }
  }

  const handleLeaveRoom = async () => {
    try {
      if (isVideoOn) {
        await disableVideo()
      }
      if (isAudioOn) {
        await disableAudio()
      }
      await leaveRoom()
      onClose()
    } catch (error) {
      console.error('Failed to leave room:', error)
      onClose()
    }
  }

  const handleToggleVideo = async () => {
    try {
      if (isVideoOn) {
        await disableVideo()
      } else {
        await enableVideo()
      }
    } catch (error) {
      console.error('Failed to toggle video:', error)
    }
  }

  const handleToggleAudio = async () => {
    try {
      if (isAudioOn) {
        await disableAudio()
      } else {
        await enableAudio()
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/95 to-black backdrop-blur-lg">
      <div className="max-w-6xl mx-auto h-full p-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className={`h-3 w-3 rounded-full ${state === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`} />
            <h2 className="text-xl font-medium text-white">Room: {roomId.slice(0, 8)}</h2>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Join Form */}
        {showJoinForm && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm w-full max-w-md">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">Join Meeting</h3>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleJoinRoom}
                disabled={!displayName.trim() || isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        )}

        {/* Video Grid */}
        {!showJoinForm && state === 'connected' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Local video */}
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl bg-black/50"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  You {displayName ? `(${displayName})` : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    className={`p-2 rounded-full ${isAudioOn ? 'bg-white/10' : 'bg-red-500'}`}
                    onClick={handleToggleAudio}
                  >
                    {isAudioOn ? <IoMic className="text-white" /> : <IoMicOff className="text-white" />}
                  </button>
                  <button
                    className={`p-2 rounded-full ${isVideoOn ? 'bg-white/10' : 'bg-red-500'}`}
                    onClick={handleToggleVideo}
                  >
                    {isVideoOn ? <IoVideocam className="text-white" /> : <IoVideocamOff className="text-white" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remote peers */}
            {peerIds.map((peerId) => (
              <RemotePeer key={peerId} peerId={peerId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RemotePeer({ peerId }: { peerId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { stream } = useRemoteVideo({ peerId })

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [stream])

  return (
    <div className="relative aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-2xl bg-black/50"
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
      <span className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
        Peer {peerId.slice(0, 8)}
      </span>
    </div>
  )
} 