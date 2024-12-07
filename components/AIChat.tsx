import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send } from 'lucide-react'

export default function AIChat() {
  return (
    <Card className="absolute bottom-16 right-4 w-80">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-secondary p-2 rounded-lg">
            How can I assist you today?
          </div>
          <div className="bg-primary text-primary-foreground p-2 rounded-lg text-right">
            What&apos;s the latest proposal I can vote on?
          </div>
          <div className="bg-secondary p-2 rounded-lg">
            The latest proposal you can vote on is &quot;Expansion of Trading Zones&quot;.
            It aims to increase the number of designated areas for P2P trading
            within the metaverse. Voting ends in 3 days.
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <form className="flex w-full items-center space-x-2">
          <Input placeholder="Type your message..." />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

