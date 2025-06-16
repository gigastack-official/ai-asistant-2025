"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, MapPin, Users, ShoppingCart, Heart, Briefcase, MoreHorizontal } from "lucide-react"

interface ReminderCardProps {
  reminder: {
    id: string
    text: string
    category: string
    datetime?: string
    location?: {
      name: string
      latitude: number
      longitude: number
    }
    priority: "low" | "medium" | "high"
    completed: boolean
  }
  onToggleComplete: (id: string, completed: boolean) => void
}

export function ReminderCard({ reminder, onToggleComplete }: ReminderCardProps) {
  const getCategoryIcon = (category: string) => {
    const icons = {
      meeting: Users,
      shopping: ShoppingCart,
      personal: Heart,
      work: Briefcase,
      health: Heart,
      other: MoreHorizontal,
    }
    const IconComponent = icons[category as keyof typeof icons] || icons.other
    return <IconComponent className="h-4 w-4" />
  }

  const getCategoryGradient = (category: string) => {
    const gradients = {
      meeting: "from-blue-400 to-blue-600",
      shopping: "from-green-400 to-green-600",
      personal: "from-purple-400 to-purple-600",
      work: "from-orange-400 to-orange-600",
      health: "from-red-400 to-red-600",
      other: "from-gray-400 to-gray-600",
    }
    return gradients[category as keyof typeof gradients] || gradients.other
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-700 border-green-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      high: "bg-red-100 text-red-700 border-red-200",
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getPriorityText = (priority: string) => {
    const texts = {
      low: "Низко",
      medium: "Средне",
      high: "Важно",
    }
    return texts[priority as keyof typeof texts] || "Средне"
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardContent className="p-0">
        <div className={`h-1 bg-gradient-to-r ${getCategoryGradient(reminder.category)}`} />
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryGradient(reminder.category)} text-white`}>
                {getCategoryIcon(reminder.category)}
              </div>
              <div>
                <Badge className={`${getPriorityColor(reminder.priority)} text-xs font-medium`}>
                  {getPriorityText(reminder.priority)}
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => onToggleComplete(reminder.id, reminder.completed)}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-green-600 p-1 touch-target"
            >
              <CheckCircle2 className="h-6 w-6" />
            </Button>
          </div>

          <p className="text-gray-900 font-medium mb-3 leading-relaxed">{reminder.text}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {reminder.datetime && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(reminder.datetime).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {reminder.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{reminder.location.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
