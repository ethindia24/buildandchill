"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Room } from "@/types/shared"

interface RoomJoinDialogProps {
  isOpen: boolean
  onClose: () => void
  onJoinRoom: (roomId: string) => void
  onCreateRoom: () => void
  currentZone: Room | null
}

export function RoomJoinDialog({ isOpen, onClose, onJoinRoom, onCreateRoom, currentZone }: RoomJoinDialogProps) {
  const [roomId, setRoomId] = useState("")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Join {currentZone?.name || 'Video Room'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter an existing room code or create a new room in this zone
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              id="roomId"
              placeholder="Enter room code..."
              className="bg-gray-800 border-gray-700 text-white"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCreateRoom}
            className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
          >
            Create New Room
          </Button>
          <Button 
            onClick={() => onJoinRoom(roomId)} 
            disabled={!roomId.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 