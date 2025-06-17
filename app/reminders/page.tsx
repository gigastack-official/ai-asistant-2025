"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShoppingCart,
  Heart,
  Briefcase,
  MoreHorizontal,
  ArrowLeft,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { remindersAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Reminder {
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

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("session")
    const token = localStorage.getItem("token")

    if (session && token) {
      const userData = JSON.parse(session)
      setUser(userData)
      loadReminders()
    } else {
      router.push("/auth/sign-in")
    }
  }, [router])

  const loadReminders = async () => {
    try {
      setIsLoading(true)
      const data = await remindersAPI.getUpcoming()

      // Transform API response to match our interface
      const transformedReminders = (data.reminders || data || []).map((reminder: any) => ({
        id: reminder.id,
        text: reminder.text || reminder.title || reminder.description,
        category: reminder.category || "other",
        datetime: reminder.datetime || reminder.scheduled_at || reminder.due_date,
        location: reminder.location,
        priority: reminder.priority || "medium",
        completed: reminder.completed || reminder.status === "completed",
      }))

      setReminders(transformedReminders)
    } catch (error: any) {
      console.error("Error loading reminders:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      await remindersAPI.update(id, { completed: !completed })
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !completed } : r)))
    } catch (error: any) {
      console.error("Error updating reminder:", error)
      setError(error.message)
    }
  }

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

  const getCategoryColor = (category: string) => {
    const colors = {
      meeting: "from-blue-400 to-blue-600",
      shopping: "from-emerald-400 to-emerald-600",
      personal: "from-purple-400 to-purple-600",
      work: "from-orange-400 to-orange-600",
      health: "from-red-400 to-red-600",
      other: "from-gray-400 to-gray-600",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const activeReminders = reminders.filter((r) => !r.completed)
  const completedReminders = reminders.filter((r) => r.completed)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-white/20 p-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-3 rounded-2xl hover:bg-blue-50 transition-colors">
              <ArrowLeft className="h-6 w-6 text-slate-600" />
            </Button>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {activeReminders.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {completedReminders.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Done</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <Button onClick={loadReminders} variant="outline" size="sm" className="mt-2">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading reminders...</p>
          </div>
        )}

        {/* Active Reminders */}
        {!isLoading &&
          activeReminders.map((reminder, index) => (
            <Card
              key={reminder.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/70 backdrop-blur-sm animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div
                      className={`w-4 h-4 rounded-full bg-gradient-to-r ${getCategoryColor(reminder.category)} mt-1 shadow-sm`}
                    />
                    <div className="flex-1">
                      <p className="text-slate-800 leading-relaxed font-medium">{reminder.text}</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                        {reminder.datetime && (
                          <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(reminder.datetime).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        {reminder.location && (
                          <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg">
                            <MapPin className="h-3 w-3" />
                            <span>{reminder.location.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleComplete(reminder.id, reminder.completed)}
                    variant="ghost"
                    size="sm"
                    className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Completed Reminders */}
        {!isLoading &&
          completedReminders.slice(0, 3).map((reminder, index) => (
            <Card
              key={reminder.id}
              className="border-0 bg-slate-100/50 backdrop-blur-sm opacity-60 animate-fade-in"
              style={{ animationDelay: `${(activeReminders.length + index) * 0.1}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-500 line-through text-sm">{reminder.text}</span>
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Empty State */}
        {!isLoading && activeReminders.length === 0 && completedReminders.length === 0 && !error && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No reminders yet</p>
            <Link href="/" className="inline-block mt-4">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-6 shadow-lg">
                Create first reminder
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Link href="/">
        <Button className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-2xl hover:shadow-blue-200 transition-all duration-200 transform hover:scale-105">
          <Plus className="h-7 w-7 text-white" />
        </Button>
      </Link>
    </div>
  )
}
