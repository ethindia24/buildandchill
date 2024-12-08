import type { ReactElement } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useDataMessage } from '@huddle01/react/hooks'
import { useAccount } from 'wagmi'
import { Identity, Name } from '@coinbase/onchainkit/identity'

interface ChatProps {
  currentZone?: string | null
  mode: 'zone' | 'global'
}

interface Message {
  text: string
  from: string
  timestamp: number
  walletAddress: `0x${string}`
  isZoneChat: boolean
  type: 'chat'
}

export default function Chat({ currentZone, mode }: ChatProps): ReactElement {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { address } = useAccount()
  const [isMinimized, setIsMinimized] = useState(false)

  const { sendData } = useDataMessage({
    onMessage: (payload: string, from: string, label?: string) => {
      try {
        if (!label?.startsWith('chat:')) return
        
        const data = JSON.parse(payload)
        if (data.type !== 'chat') return

        setMessages(prev => [...prev, {
          ...data,
          from: data.walletAddress === address ? 'me' : from
        }])
      } catch (error) {
        console.error('Failed to parse chat message:', error)
      }
    }
  })

  const sendMessage = () => {
    if (!inputMessage.trim() || !address) return

    const message: Message = {
      text: inputMessage,
      from: 'me',
      timestamp: Date.now(),
      walletAddress: address,
      isZoneChat: mode === 'zone',
      type: 'chat'
    }

    sendData({
      to: '*',
      payload: JSON.stringify(message),
      label: mode === 'zone' ? `chat:${currentZone}` : 'chat:global'
    })

    setInputMessage('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredMessages = messages.filter(msg => 
    mode === 'global' ? !msg.isZoneChat : msg.isZoneChat
  )

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-black/80 backdrop-blur-lg rounded-xl shadow-xl">
      <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
        <h3 className="text-white font-medium">
          {mode === 'global' ? 'Global Chat' : 'Zone Chat'}
        </h3>
        <button 
          onClick={() => setIsMinimized(prev => !prev)}
          className="text-white/60 hover:text-white"
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className="h-96 overflow-y-auto p-4 space-y-2">
            {filteredMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  msg.from === 'me' ? 'bg-blue-500/20' : 'bg-white/10'
                }`}>
                  <div className="text-xs text-white/60 mb-1">
                    <Identity address={msg.walletAddress}>
                      <Name className="text-white/80" />
                    </Identity>
                  </div>
                  <p className="text-sm text-white">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Type a message in ${mode} chat...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}