"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from "react"
import AIChat from "@/components/AIChat"
import ActionToolbar from "@/components/ActionToolbar"
import Minimap from "@/components/Minimap"
import NotificationSystem from "@/components/NotificationSystem"
import ZoneOverlay from "@/components/ZoneOverlay"
import SpaceBuilder from "@/components/SpaceBuilder"
import { motion, AnimatePresence } from "framer-motion"

const TILE_SIZE = 32
const AVATAR_SIZE = 24
const MOVE_SPEED = 5

interface Avatar {
  id: string
  x: number
  y: number
  color: string
}

interface Boundary {
  x: number
  y: number
  width: number
  height: number
}

const boundaries: Boundary[] = [
  { x: 100, y: 100, width: 200, height: 200 },
  { x: 400, y: 300, width: 200, height: 200 },
  { x: 700, y: 100, width: 200, height: 200 },
]

const checkCollision = (
  position: { x: number; y: number },
  avatars: Avatar[],
  canvasSize: { width: number; height: number }
) => {
  // Check boundaries
  if (
    position.x < AVATAR_SIZE / 2 ||
    position.x > canvasSize.width - AVATAR_SIZE / 2 ||
    position.y < AVATAR_SIZE / 2 ||
    position.y > canvasSize.height - AVATAR_SIZE / 2
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

const checkZone = (position: { x: number; y: number }) => {
  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i]
    if (
      position.x >= boundary.x &&
      position.x <= boundary.x + boundary.width &&
      position.y >= boundary.y &&
      position.y <= boundary.y + boundary.height
    ) {
      return ['Event Zone', 'Marketplace Zone', 'Governance Zone'][i]
    }
  }
  return null
}

export default function Home() {
  const [showChat, setShowChat] = useState(false)
  const [showSpaceBuilder, setShowSpaceBuilder] = useState(false)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [currentZone, setCurrentZone] = useState<string | null>(null)
  const [playerAvatar, setPlayerAvatar] = useState<Avatar>({ id: 'player', x: 400, y: 300, color: 'red' })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const keysPressed = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Add mock players for testing
  useEffect(() => {
    setAvatars([
      { id: 'bot1', x: 200, y: 200, color: 'blue' },
      { id: 'bot2', x: 600, y: 400, color: 'green' }
    ])
  }, [])

  const movePlayer = useCallback(() => {
    const newPosition = { ...playerAvatar }
    let moved = false

    if (keysPressed.current.has('ArrowUp')) {
      newPosition.y -= MOVE_SPEED
      moved = true
    }
    if (keysPressed.current.has('ArrowDown')) {
      newPosition.y += MOVE_SPEED
      moved = true
    }
    if (keysPressed.current.has('ArrowLeft')) {
      newPosition.x -= MOVE_SPEED
      moved = true
    }
    if (keysPressed.current.has('ArrowRight')) {
      newPosition.x += MOVE_SPEED
      moved = true
    }

    if (moved && !checkCollision(newPosition, avatars, canvasSize)) {
      setPlayerAvatar(newPosition)
      const newZone = checkZone(newPosition)
      if (newZone !== currentZone) {
        setCurrentZone(newZone)
      }
    }
  }, [playerAvatar, avatars, canvasSize, currentZone])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const animationFrame = requestAnimationFrame(function animate() {
      movePlayer()
      requestAnimationFrame(animate)
    })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(animationFrame)
    }
  }, [movePlayer])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawAvatar = (avatar: Avatar) => {
      ctx.beginPath()
      ctx.arc(avatar.x, avatar.y, AVATAR_SIZE / 2, 0, 2 * Math.PI)
      ctx.fillStyle = avatar.color
      ctx.fill()
    }

    const drawZones = () => {
      boundaries.forEach((boundary, index) => {
        ctx.fillStyle = `rgba(${index * 100}, ${255 - index * 100}, 0, 0.2)`
        ctx.fillRect(boundary.x, boundary.y, boundary.width, boundary.height)
      })
    }

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)'
      for (let x = 0; x < canvasSize.width; x += TILE_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasSize.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvasSize.height; y += TILE_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasSize.width, y)
        ctx.stroke()
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
      drawGrid()
      drawZones()
      avatars.forEach(drawAvatar)
      drawAvatar(playerAvatar)
      requestAnimationFrame(animate)
    }

    animate()
  }, [avatars, playerAvatar, canvasSize])

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
      <NotificationSystem />
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

