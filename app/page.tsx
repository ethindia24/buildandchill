"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from "react"
import AIChat from "@/components/AIChat"
import ActionToolbar from "@/components/ActionToolbar"
import SpaceBuilder from "@/components/SpaceBuilder"
import { motion, AnimatePresence } from "framer-motion"

const TILE_SIZE = 32
const AVATAR_SIZE = 24
const MOVE_SPEED = 5
const WORLD_WIDTH = 3200
const WORLD_HEIGHT = 2000

interface Avatar {
  id: string
  x: number
  y: number
  name?: string
  color: string
}

interface Viewport {
  x: number
  y: number
  width: number
  height: number
}

interface Room {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  type: 'event' | 'social' | 'sponsor' | 'workshop'
  theme?: {
    color: string
  }
}

// This will eventually come from our smart contract
const ROOM_LAYOUTS: Room[] = [
  // Main Stage - Heart of the space
  { 
    id: 'main-stage', 
    name: 'Main Stage', 
    x: WORLD_WIDTH/2 - 350, 
    y: WORLD_HEIGHT/2 - 250, 
    width: 700,  // Prominent but not overwhelming
    height: 500, 
    type: 'event', 
    theme: { color: '#FF4081' } 
  },

  // Workshops form a balanced pair on the left
  { 
    id: 'workshop-1', 
    name: 'Workshop A', 
    x: 250, 
    y: WORLD_HEIGHT/2 - 450, 
    width: 400, 
    height: 300, 
    type: 'workshop', 
    theme: { color: '#4CAF50' } 
  },
  { 
    id: 'workshop-2', 
    name: 'Workshop B', 
    x: 250, 
    y: WORLD_HEIGHT/2 + 150, 
    width: 400, 
    height: 300, 
    type: 'workshop', 
    theme: { color: '#9C27B0' } 
  },

  // Networking spaces in harmony with main stage
  { 
    id: 'networking-north', 
    name: 'Networking North', 
    x: WORLD_WIDTH/2 - 250, 
    y: 250, 
    width: 500, 
    height: 250, 
    type: 'social', 
    theme: { color: '#2196F3' } 
  },
  { 
    id: 'networking-south', 
    name: 'Networking South', 
    x: WORLD_WIDTH/2 - 250, 
    y: WORLD_HEIGHT - 500, 
    width: 500, 
    height: 250, 
    type: 'social', 
    theme: { color: '#2196F3' } 
  },

  // Sponsor booths in a gentle curve on the right
  ...Array.from({ length: 12 }, (_, i) => {
    // Create 4 rows of 3 booths each, with a slight curve
    const row = Math.floor(i / 3)
    const col = i % 3
    const curve = Math.sin(row * Math.PI / 3) * 100  // Gentle curve
    
    const boothWidth = 250
    const boothHeight = 160
    const horizontalSpacing = 300
    const verticalSpacing = 250
    
    return {
      id: `sponsor-${i + 1}`,
      name: `Sponsor ${i + 1}`,
      x: WORLD_WIDTH - 900 + col * horizontalSpacing + curve,
      y: 400 + row * verticalSpacing,
      width: boothWidth,
      height: boothHeight,
      type: 'sponsor' as const,
      theme: { 
        color: `hsla(${i * 30}, 70%, 60%, 0.85)`
      }
    }
  })
]

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
  const [playerAvatar, setPlayerAvatar] = useState<Avatar>({ 
    id: 'player', 
    x: WORLD_WIDTH/2, 
    y: WORLD_HEIGHT/2, 
    name: 'Player',
    color: 'red' 
  })
  const [viewport, setViewport] = useState<Viewport>({ 
    x: 0, 
    y: 0, 
    width: window.innerWidth, 
    height: window.innerHeight 
  })
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
      setViewport(prev => ({ 
        x: clampedX, 
        y: clampedY,
        width: prev.width,
        height: prev.height
      }))

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
      const drawMinimap = (ctx: CanvasRenderingContext2D, viewport: Viewport, playerAvatar: Avatar) => {
        const minimapWidth = 180
        const minimapHeight = (WORLD_HEIGHT / WORLD_WIDTH) * minimapWidth
        
        // Clear previous frame
        ctx.clearRect(0, 0, minimapWidth + 20, minimapHeight + 10)
        
        const scale = minimapWidth / WORLD_WIDTH
        
        // Draw minimap background with border
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(10, 5, minimapWidth, minimapHeight)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.strokeRect(10, 5, minimapWidth, minimapHeight)
        
        // Draw rooms on minimap
        ROOM_LAYOUTS.forEach((room) => {
          ctx.fillStyle = room.theme?.color || 'rgba(100, 100, 100, 0.5)'
          ctx.fillRect(
            10 + room.x * scale,
            5 + room.y * scale,
            room.width * scale,
            room.height * scale
          )
        })
        
        // Draw viewport area
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.strokeRect(
          10 + viewport.x * scale,
          5 + viewport.y * scale,
          viewport.width * scale,
          viewport.height * scale
        )
        
        // Draw player position
        ctx.fillStyle = '#FF4444'
        ctx.beginPath()
        ctx.arc(
          10 + playerAvatar.x * scale,
          5 + playerAvatar.y * scale,
          4,
          0,
          2 * Math.PI
        )
        ctx.fill()
      }

      drawMinimap(ctx, viewport, playerAvatar)

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
      { 
        id: 'bot1', 
        x: 200, 
        y: 200, 
        name: 'Bot 1',
        color: 'blue' 
      },
      { 
        id: 'bot2', 
        x: 600, 
        y: 400, 
        name: 'Bot 2',
        color: 'green' 
      }
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

