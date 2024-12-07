import { Button } from "@/components/ui/button"
import { Link, MessageSquare, Move, Share2, Vote, Edit3 } from 'lucide-react'

interface ActionToolbarProps {
  onOpenSpaceBuilder: () => void
}

export default function ActionToolbar({ onOpenSpaceBuilder }: ActionToolbarProps) {
  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2 rounded-full bg-background/80 p-2 backdrop-blur-sm">
      <Button variant="ghost" size="icon">
        <Move className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Link className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Vote className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onOpenSpaceBuilder}>
        <Edit3 className="h-4 w-4" />
      </Button>
    </div>
  )
}

