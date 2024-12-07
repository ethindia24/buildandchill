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

interface VideoRoomProps {
  roomId: string
  token: string
  onClose: () => void
}

export default function VideoRoom({ roomId, token, onClose }: VideoRoomProps) {
  const [displayName, setDisplayName] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  const { joinRoom, state } = useRoom({
    onJoin: (room) => {
      console.log('Joined room:', room)
      updateMetadata({ displayName })
    }
  })

  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo()
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio()
  const { updateMetadata } = useLocalPeer()
  const { peerIds } = usePeerIds()

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Video Room</h2>
          <div className="space-x-2">
            {state === 'idle' && (
              <>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="border p-2 rounded"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => joinRoom({ roomId, token })}
                >
                  Join Room
                </button>
              </>
            )}
            {state === 'connected' && (
              <>
                <button
                  className={`px-4 py-2 rounded ${
                    isVideoOn ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  onClick={() => isVideoOn ? disableVideo() : enableVideo()}
                >
                  {isVideoOn ? 'Stop Video' : 'Start Video'}
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    isAudioOn ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  onClick={() => isAudioOn ? disableAudio() : enableAudio()}
                >
                  {isAudioOn ? 'Mute' : 'Unmute'}
                </button>
                <button
                  onClick={onClose}
                  className="ml-4 bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Leave Room
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Local video */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg bg-black"
            />
            <span className="absolute bottom-2 left-2 text-white bg-black/50 px-2 rounded">
              You
            </span>
          </div>

          {/* Remote peers */}
          {peerIds.map((peerId) => (
            <RemotePeer key={peerId} peerId={peerId} />
          ))}
        </div>
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
  }, [stream])

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-lg bg-black"
      />
      <span className="absolute bottom-2 left-2 text-white bg-black/50 px-2 rounded">
        Peer {peerId.slice(0, 8)}
      </span>
    </div>
  )
} 