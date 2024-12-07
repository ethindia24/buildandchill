import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { X } from 'lucide-react'
import { useState } from "react"

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Huddle01 Workshop",
      description: "Join the workshop to learn about Huddle01",
    },
    {
      id: 2,
      title: "CDP Workshop",
      description: "Join the workshop to learn about CDP",
    },
  ])

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  return (
    <div className="absolute right-4 top-40 space-y-2">
      {notifications.map((notification) => (
        <Card key={notification.id} className="w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{notification.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{notification.description}</CardDescription>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => removeNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

