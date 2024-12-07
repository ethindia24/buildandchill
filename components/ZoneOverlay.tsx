import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ZoneOverlayProps {
  zone: string
}

export default function ZoneOverlay({ zone }: ZoneOverlayProps) {
  const renderZoneContent = () => {
    switch (zone) {
      case 'Base Zone':
        return (
          <>
            <CardHeader>
              <CardTitle>Base Zone</CardTitle>
              <CardDescription>Build on Base</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Basenames Workshop</p>
              <p>Date: Dec 7, 2024</p>
              <p>Time: 9:00 AM IST</p>
            </CardContent>
            <CardFooter>
              <Button>Join Event</Button>
            </CardFooter>
          </>
        )
      case 'Marketplace Zone':
        return (
          <>
            <CardHeader>
              <CardTitle>Huddle01 Zone</CardTitle>
              <CardDescription>Build on Huddle01</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Huddle01 Workshop</p>
              <p>Date: Dec 7, 2024</p>
              <p>Time: 10:00 AM IST</p>
            </CardContent>
            <CardFooter>
              <Button>Join Event</Button>
            </CardFooter>
          </>
        )
      case 'CDP Zone':
        return (
          <>
            <CardHeader>
              <CardTitle>CDP Zone</CardTitle>
              <CardDescription>Build on CDP</CardDescription>
            </CardHeader>
            <CardContent>
              <p>CDP Workshop</p>
              <p>Date: Dec 7, 2024</p>
              <p>Time: 11:00 AM IST</p>
            </CardContent>
            <CardFooter>
              <Button>Join Event</Button>
            </CardFooter>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-80">
      {renderZoneContent()}
    </Card>
  )
}

