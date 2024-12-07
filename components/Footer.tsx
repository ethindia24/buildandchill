import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function Footer() {
  return (
    <footer className="border-t p-4">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="global" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="global">Global Chat</TabsTrigger>
            <TabsTrigger value="space">Space Chat</TabsTrigger>
            <TabsTrigger value="dm">Direct Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="global">
            <div className="flex items-center space-x-2">
              <Input placeholder="Type your message..." />
              <Button>Send</Button>
            </div>
          </TabsContent>
          <TabsContent value="space">
            <div className="flex items-center space-x-2">
              <Input placeholder="Type your message..." />
              <Button>Send</Button>
            </div>
          </TabsContent>
          <TabsContent value="dm">
            <div className="flex items-center space-x-2">
              <Input placeholder="Type your message..." />
              <Button>Send</Button>
            </div>
          </TabsContent>
        </Tabs>
        <div className="space-x-2">
          <Button variant="link">Help</Button>
          <Button variant="link">FAQ</Button>
          <Button variant="link">Report Issue</Button>
        </div>
      </div>
    </footer>
  )
}

