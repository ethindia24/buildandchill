import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface SpaceBuilderProps {
  onClose: () => void
}

export default function SpaceBuilder({ onClose }: SpaceBuilderProps) {
  const [spaceName, setSpaceName] = useState("")
  const [spaceDescription, setSpaceDescription] = useState("")
  const [accessType, setAccessType] = useState("public")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the space configuration
    console.log({ spaceName, spaceDescription, accessType })
    onClose()
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Create New Space</CardTitle>
        <CardDescription>Configure your virtual environment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Space"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your space..."
                value={spaceDescription}
                onChange={(e) => setSpaceDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="access">Access Type</Label>
              <Select
                value={accessType}
                onValueChange={(value) => setAccessType(value)}
              >
                <SelectTrigger id="access">
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="invite-only">Invite Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Create Space</Button>
      </CardFooter>
    </Card>
  )
}

