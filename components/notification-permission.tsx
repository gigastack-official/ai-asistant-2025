"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, X } from "lucide-react"

interface NotificationPermissionProps {
  onPermissionGranted?: () => void
  onPermissionDenied?: () => void
}

export function NotificationPermission({ onPermissionGranted, onPermissionDenied }: NotificationPermissionProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission)

      // Show prompt if permission is default (not asked yet)
      if (Notification.permission === "default") {
        // Delay showing the prompt to avoid being too intrusive
        const timer = setTimeout(() => {
          setShowPrompt(true)
        }, 3000)

        return () => clearTimeout(timer)
      }
    }
  }, [])

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        setShowPrompt(false)
        onPermissionGranted?.()

        // Show a test notification
        new Notification("🔔 Уведомления включены!", {
          body: "Теперь вы будете получать уведомления о напоминаниях",
          icon: "/icon-192x192.png",
          tag: "permission-granted",
        })
      } else {
        onPermissionDenied?.()
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      onPermissionDenied?.()
    }
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    // Don't ask again for this session
    sessionStorage.setItem("notification-prompt-dismissed", "true")
  }

  // Don't show if notifications aren't supported
  if (!("Notification" in window)) {
    return null
  }

  // Don't show if permission already granted or denied
  if (permission !== "default") {
    return null
  }

  // Don't show if user dismissed it this session
  if (sessionStorage.getItem("notification-prompt-dismissed")) {
    return null
  }

  // Don't show if not prompted yet
  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Включить уведомления?</h3>
              <p className="text-xs text-slate-600 mb-3">Получайте push-уведомления о ваших напоминаниях</p>

              <div className="flex space-x-2">
                <Button
                  onClick={requestPermission}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs px-3 py-1 h-8"
                >
                  Разрешить
                </Button>
                <Button
                  onClick={dismissPrompt}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 text-xs px-3 py-1 h-8"
                >
                  Не сейчас
                </Button>
              </div>
            </div>

            <Button
              onClick={dismissPrompt}
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
