"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import ActionToolbar from "@/components/ActionToolbar"
import SpaceBuilder from "@/components/SpaceBuilder"
import { motion, AnimatePresence } from "framer-motion"

const AVATAR_SIZE = 24
const MOVE_SPEED = 5
const VELOCITY_DECAY = 0.8
const WORLD_WIDTH = 3200
const WORLD_HEIGHT = 2000
const TILE_SIZE = 100

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

interface Velocity {
  x: number
  y: number
}

export default function Home() {
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
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const animationFrameId = useRef<number | null>(null)
  const keysPressed = useRef(new Set<string>())
  const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 })

  // Movement handling
  const movePlayer = useCallback(() => {
    const newVelocity = { x: 0, y: 0 }
    let moved = false

    // Combine velocities for diagonal movement
    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
      newVelocity.y -= MOVE_SPEED
      moved = true
    }
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
      newVelocity.y += MOVE_SPEED
      moved = true
    }
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
      newVelocity.x -= MOVE_SPEED
      moved = true
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
      newVelocity.x += MOVE_SPEED
      moved = true
    }

    // Normalize diagonal movement
    if (newVelocity.x !== 0 && newVelocity.y !== 0) {
      const length = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y)
      newVelocity.x = (newVelocity.x / length) * MOVE_SPEED
      newVelocity.y = (newVelocity.y / length) * MOVE_SPEED
    }

    if (!moved) {
      newVelocity.x = velocity.x * VELOCITY_DECAY
      newVelocity.y = velocity.y * VELOCITY_DECAY
    }

    setVelocity(newVelocity)

    const newPosition: Avatar = {
      ...playerAvatar,
      x: playerAvatar.x + newVelocity.x,
      y: playerAvatar.y + newVelocity.y
    }

    // Keep player within world bounds
    newPosition.x = Math.max(AVATAR_SIZE, Math.min(newPosition.x, WORLD_WIDTH - AVATAR_SIZE))
    newPosition.y = Math.max(AVATAR_SIZE, Math.min(newPosition.y, WORLD_HEIGHT - AVATAR_SIZE))
    
    setPlayerAvatar(newPosition)
    
    // Update viewport to follow player smoothly
    const targetX = newPosition.x - canvasSize.width / 2
    const targetY = newPosition.y - canvasSize.height / 2
    
    setViewport(prev => ({
      ...prev,
      x: Math.max(0, Math.min(targetX, WORLD_WIDTH - canvasSize.width)),
      y: Math.max(0, Math.min(targetY, WORLD_HEIGHT - canvasSize.height))
    }))
  }, [playerAvatar, velocity, canvasSize.width, canvasSize.height])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key)
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Move drawMinimap before animation loop
  const drawMinimap = useCallback((ctx: CanvasRenderingContext2D, viewport: Viewport, playerAvatar: Avatar) => {
    const minimapWidth = 180
    const minimapHeight = (WORLD_HEIGHT / WORLD_WIDTH) * minimapWidth
    
    ctx.clearRect(0, 0, minimapWidth + 20, minimapHeight + 10)
    
    const scale = minimapWidth / WORLD_WIDTH
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(10, 5, minimapWidth, minimapHeight)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.strokeRect(10, 5, minimapWidth, minimapHeight)
    
    ROOM_LAYOUTS.forEach((room) => {
      ctx.fillStyle = room.theme?.color || 'rgba(100, 100, 100, 0.5)'
      ctx.fillRect(
        10 + room.x * scale,
        5 + room.y * scale,
        room.width * scale,
        room.height * scale
      )
    })
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.strokeRect(
      10 + viewport.x * scale,
      5 + viewport.y * scale,
      viewport.width * scale,
      viewport.height * scale
    )
    
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
  }, [])

  // Animation loop with combined movement and rendering
  useEffect(() => {
    const animate = () => {
      movePlayer()
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

      ctx.save()
      ctx.translate(-viewport.x, -viewport.y)

      // Draw grid
      const gridOffsetX = viewport.x % TILE_SIZE
      const gridOffsetY = viewport.y % TILE_SIZE
      
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)'
      ctx.beginPath()

      for (let x = viewport.x - gridOffsetX; x <= viewport.x + canvasSize.width; x += TILE_SIZE) {
        ctx.moveTo(x, viewport.y)
        ctx.lineTo(x, viewport.y + canvasSize.height)
      }

      for (let y = viewport.y - gridOffsetY; y <= viewport.y + canvasSize.height; y += TILE_SIZE) {
        ctx.moveTo(viewport.x, y)
        ctx.lineTo(viewport.x + canvasSize.width, y)
      }
      ctx.stroke()

      // Draw rooms
      ROOM_LAYOUTS.forEach((room) => {
        ctx.fillStyle = room.theme?.color || 'rgba(100, 100, 100, 0.5)'
        ctx.fillRect(room.x, room.y, room.width, room.height)
        
        // Always show room names
        ctx.fillStyle = 'white'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(room.name, room.x + room.width/2, room.y + room.height/2)
        
        // Highlight current room
        if (currentZone && currentZone.id === room.id) {
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2
          ctx.strokeRect(room.x, room.y, room.width, room.height)
        }
      })

      // Draw avatars
      avatars.forEach((avatar) => {
        ctx.fillStyle = avatar.color
        ctx.beginPath()
        ctx.arc(avatar.x, avatar.y, AVATAR_SIZE/2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw player
      ctx.fillStyle = playerAvatar.color
      ctx.beginPath()
      ctx.arc(playerAvatar.x, playerAvatar.y, AVATAR_SIZE/2, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      drawMinimap(ctx, viewport, playerAvatar)

      animationFrameId.current = requestAnimationFrame(animate)
    }
    
    animationFrameId.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [movePlayer, viewport, playerAvatar, avatars, currentZone, canvasSize, drawMinimap])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = window.innerWidth
        const height = window.innerHeight
        
        // Update canvas size
        canvasRef.current.width = width
        canvasRef.current.height = height
        
        // Update state
        setCanvasSize({ width, height })
        setViewport(prev => ({ ...prev, width, height }))
      }
    }
    
    handleResize() // Initial size
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left + viewport.x
    const y = e.clientY - rect.top + viewport.y
    
    const newZone = checkZone({ x, y })
    if (newZone !== currentZone) {
      setCurrentZone(newZone)
    }
  }, [viewport, currentZone])

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
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
        onMouseMove={handleMouseMove}
      />
      <AnimatePresence>
        {showSpaceBuilder && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <SpaceBuilder onClose={() => setShowSpaceBuilder(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ActionToolbar onOpenSpaceBuilder={() => setShowSpaceBuilder(true)} />
    </div>
  )
}

