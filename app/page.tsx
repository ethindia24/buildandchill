"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from "react"
import AIChat from "@/components/AIChat"
import ActionToolbar from "@/components/ActionToolbar"
import Minimap from "@/components/Minimap"
import SpaceBuilder from "@/components/SpaceBuilder"
import { motion, AnimatePresence } from "framer-motion"

const TILE_SIZE = 32
const AVATAR_SIZE = 24
const MOVE_SPEED = 5
const WORLD_WIDTH = 3200  // 100 tiles wide
const WORLD_HEIGHT = 2400 // 75 tiles high

interface Room {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  type: 'sponsor' | 'event' | 'social' | 'workshop'
  theme?: {
    color: string
    logoUrl?: string
  }
}

// This will eventually come from our smart contract
const ROOM_LAYOUTS: Room[] = [
  // Main halls
  { id: 'main-stage', name: 'Main Stage', x: 1400, y: 1000, width: 400, height: 300, type: 'event', theme: { color: '#FF4081' } },
  { id: 'networking', name: 'Networking Lounge', x: 800, y: 800, width: 300, height: 200, type: 'social', theme: { color: '#2196F3' } },
  
  // Sponsor rooms - arranged in a circular pattern
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `sponsor-${i + 1}`,
    name: `Sponsor ${i + 1}`,
    x: WORLD_WIDTH/2 + Math.cos((i * Math.PI * 2) / 12) * 800,
    y: WORLD_HEIGHT/2 + Math.sin((i * Math.PI * 2) / 12) * 800,
    width: 200,
    height: 200,
    type: 'sponsor' as const,
    theme: { color: `hsl(${i * 30}, 70%, 60%)` }
  })),

  // Workshop spaces
  { id: 'workshop-1', name: 'Workshop A', x: 400, y: 400, width: 250, height: 200, type: 'workshop' as const, theme: { color: '#4CAF50' } },
  { id: 'workshop-2', name: 'Workshop B', x: 2600, y: 400, width: 250, height: 200, type: 'workshop' as const, theme: { color: '#9C27B0' } }
]

interface Avatar {
  id: string
  x: number
  y: number
  color: string
  username?: string
}

// Update boundary checking to use rooms
const checkCollision = (
  position: { x: number; y: number },
  avatars: Avatar[]
) => {
  // Check world boundaries
  if (
    position.x < AVATAR_SIZE / 2 ||
    position.x > WORLD_WIDTH - AVATAR_SIZE / 2 ||
    position.y < AVATAR_SIZE / 2 ||
    position.y > WORLD_HEIGHT - AVATAR_SIZE / 2
  ) {
    return true
  }

  // Check other avatars
  for (const avatar of avatars) {
    const dx = position.x - avatar.x
    const dy = position.y - avatar.y
    if (Math.sqrt(dx * dx + dy * dy) < AVATAR_SIZE) {
      return true
    }
  }

  return false
}

const checkZone = (position: { x: number; y: number }): Room | null => {
  for (const room of ROOM_LAYOUTS) {
    if (
      position.x >= room.x &&
      position.x <= room.x + room.width &&
      position.y >= room.y &&
      position.y <= room.y + room.height
    ) {
      return room
    }
  }
  return null
}

interface ZoneOverlayProps {
  zone: Room | null
}

const ZoneOverlay: React.FC<ZoneOverlayProps> = ({ zone }) => {
  if (!zone) return null
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
      {zone.name}
    </div>
  )
}

export default function Home() {
  const [showChat, setShowChat] = useState(false)
  const [showSpaceBuilder, setShowSpaceBuilder] = useState(false)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [currentZone, setCurrentZone] = useState<Room | null>(null)
  const [playerAvatar, setPlayerAvatar] = useState<Avatar>({ id: 'player', x: WORLD_WIDTH/2, y: WORLD_HEIGHT/2, color: 'red' })
  const [viewport, setViewport] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const keysPressed = useRef<Set<string>>(new Set())
  const lastRender = useRef<number>(0)

  // Optimize movement with delta time
  const movePlayer = useCallback((timestamp: number) => {
    const delta = (timestamp - lastRender.current) / 16.67 // normalize to 60fps
    lastRender.current = timestamp
    
    const newPosition = { ...playerAvatar }
    let moved = false

    const moveAmount = MOVE_SPEED * delta

    if (keysPressed.current.has('ArrowUp')) {
      newPosition.y -= moveAmount
      moved = true
    }
    if (keysPressed.current.has('ArrowDown')) {
      newPosition.y += moveAmount
      moved = true
    }
    if (keysPressed.current.has('ArrowLeft')) {
      newPosition.x -= moveAmount
      moved = true
    }
    if (keysPressed.current.has('ArrowRight')) {
      newPosition.x += moveAmount
      moved = true
    }

    if (moved && !checkCollision(newPosition, avatars)) {
      setPlayerAvatar(newPosition)
      
      // Update viewport directly here instead of in a separate effect
      const targetX = newPosition.x - canvasSize.width / 2
      const targetY = newPosition.y - canvasSize.height / 2
      const clampedX = Math.max(0, Math.min(targetX, WORLD_WIDTH - canvasSize.width))
      const clampedY = Math.max(0, Math.min(targetY, WORLD_HEIGHT - canvasSize.height))
      setViewport({ x: clampedX, y: clampedY })

      const newZone = checkZone(newPosition)
      if (newZone !== currentZone) {
        setCurrentZone(newZone)
      }
    }
  }, [playerAvatar, avatars, currentZone, canvasSize.width, canvasSize.height])

  // Handle movement animation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    let animationFrameId: number

    const animate = (timestamp: number) => {
      movePlayer(timestamp)
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(animationFrameId)
    }
  }, [movePlayer])

  // Handle canvas size updates
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
      
      // Draw grid
      const gridOffsetX = viewport.x % TILE_SIZE
      const gridOffsetY = viewport.y % TILE_SIZE
      
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)'
      ctx.beginPath()

      for (let x = -gridOffsetX; x <= canvasSize.width; x += TILE_SIZE) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasSize.height)
      }

      for (let y = -gridOffsetY; y <= canvasSize.height; y += TILE_SIZE) {
        ctx.moveTo(0, y)
        ctx.lineTo(canvasSize.width, y)
      }
      ctx.stroke()

      // Draw rooms
      ROOM_LAYOUTS.forEach((room) => {
        const screenX = room.x - viewport.x
        const screenY = room.y - viewport.y

        if (
          screenX < canvasSize.width &&
          screenX + room.width > 0 &&
          screenY < canvasSize.height &&
          screenY + room.height > 0
        ) {
          ctx.fillStyle = room.theme?.color || 'rgba(100, 100, 100, 0.2)'
          ctx.fillRect(screenX, screenY, room.width, room.height)
          
          ctx.fillStyle = 'white'
          ctx.font = '14px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(room.name, screenX + room.width/2, screenY + room.height/2)
        }
      })

      // Draw avatars
      const drawAvatar = (avatar: Avatar) => {
        const screenX = avatar.x - viewport.x
        const screenY = avatar.y - viewport.y
        
        if (
          screenX >= -AVATAR_SIZE && 
          screenX <= canvasSize.width + AVATAR_SIZE &&
          screenY >= -AVATAR_SIZE && 
          screenY <= canvasSize.height + AVATAR_SIZE
        ) {
          ctx.beginPath()
          ctx.arc(screenX, screenY, AVATAR_SIZE / 2, 0, 2 * Math.PI)
          ctx.fillStyle = avatar.color
          ctx.fill()
        }
      }

      avatars.forEach(drawAvatar)
      drawAvatar(playerAvatar)

      // Draw minimap
      const minimapSize = 150
      const scale = minimapSize / Math.max(WORLD_WIDTH, WORLD_HEIGHT)
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(10, 10, minimapSize, minimapSize)
      
      ROOM_LAYOUTS.forEach((room) => {
        ctx.fillStyle = room.theme?.color || 'rgba(100, 100, 100, 0.5)'
        ctx.fillRect(
          10 + room.x * scale,
          10 + room.y * scale,
          room.width * scale,
          room.height * scale
        )
      })
      
      ctx.strokeStyle = 'white'
      ctx.strokeRect(
        10 + viewport.x * scale,
        10 + viewport.y * scale,
        canvasSize.width * scale,
        canvasSize.height * scale
      )
      
      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.arc(
        10 + playerAvatar.x * scale,
        10 + playerAvatar.y * scale,
        2,
        0,
        2 * Math.PI
      )
      ctx.fill()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [viewport, playerAvatar, avatars, canvasSize])

  // Add mock players for testing
  useEffect(() => {
    setAvatars([
      { id: 'bot1', x: 200, y: 200, color: 'blue' },
      { id: 'bot2', x: 600, y: 400, color: 'green' }
    ])
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0"
      />

      <AnimatePresence>
        {currentZone && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <ZoneOverlay zone={currentZone} />
          </motion.div>
        )}
      </AnimatePresence>

      <Minimap playerPosition={playerAvatar} canvasSize={canvasSize} />
      <ActionToolbar onOpenSpaceBuilder={() => setShowSpaceBuilder(true)} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          className="absolute bottom-4 right-4"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          AI Chat
        </Button>
      </motion.div>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <AIChat />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSpaceBuilder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <SpaceBuilder onClose={() => setShowSpaceBuilder(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

