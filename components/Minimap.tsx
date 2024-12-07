import { Card } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface MinimapProps {
  playerPosition: { x: number; y: number }
  canvasSize: { width: number; height: number }
}

export default function Minimap({ playerPosition, canvasSize }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const minimapWidth = 150
    const minimapHeight = 150
    const scaleFactor = Math.min(minimapWidth / canvasSize.width, minimapHeight / canvasSize.height)

    // Clear canvas
    ctx.clearRect(0, 0, minimapWidth, minimapHeight)

    // Draw background
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)'
    ctx.fillRect(0, 0, minimapWidth, minimapHeight)

    // Draw zones
    const zones = [
      { x: 100, y: 100, width: 200, height: 200, color: 'rgba(0, 255, 0, 0.4)' },
      { x: 400, y: 300, width: 200, height: 200, color: 'rgba(0, 0, 255, 0.4)' },
      { x: 700, y: 100, width: 200, height: 200, color: 'rgba(255, 0, 0, 0.4)' },
    ]

    zones.forEach(zone => {
      ctx.fillStyle = zone.color
      ctx.fillRect(
        zone.x * scaleFactor,
        zone.y * scaleFactor,
        zone.width * scaleFactor,
        zone.height * scaleFactor
      )
    })

    // Draw player position
    ctx.fillStyle = 'yellow'
    ctx.beginPath()
    ctx.arc(
      playerPosition.x * scaleFactor,
      playerPosition.y * scaleFactor,
      3,
      0,
      2 * Math.PI
    )
    ctx.fill()

    // Draw view area
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(
      (playerPosition.x - canvasSize.width / 2) * scaleFactor,
      (playerPosition.y - canvasSize.height / 2) * scaleFactor,
      canvasSize.width * scaleFactor,
      canvasSize.height * scaleFactor
    )
  }, [playerPosition, canvasSize])

  return (
    <Card className="absolute right-4 top-4 h-40 w-40 p-2">
      <canvas ref={canvasRef} width={150} height={150} />
    </Card>
  )
}

