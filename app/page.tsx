"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Menu, CheckCircle2, List, Settings, LogOut, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { remindersAPI } from "@/lib/api"
import { NotificationPermission } from "@/components/notification-permission"
import { WebSocketStatus } from "@/components/websocket-status"
import { useWebSocket } from "@/hooks/use-websocket"

export default function ReminderApp() {
  const [newReminder, setNewReminder] = useState("")
  const [answerText, setAnswerText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  // Stable callback functions
  const handleWebSocketMessage = useCallback((type: string, data: any) => {
    console.log("Received WebSocket message:", type, data)

    switch (type) {
      case "reminder_created":
        setAnswerText("✅ Напоминание создано и синхронизировано!")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        break
      case "reminder_notification":
        // Notification will be handled automatically by WebSocket manager
        break
      case "system_notification":
        setAnswerText(data.message || "Системное уведомление")
        break
    }
  }, [])

  const handleWebSocketConnect = useCallback(() => {
    console.log("WebSocket connected successfully")
  }, [])

  const handleWebSocketDisconnect = useCallback((event: any) => {
    console.log("WebSocket disconnected:", event)
  }, [])

  const handleWebSocketError = useCallback((error: any) => {
    console.error("WebSocket error:", error)
  }, [])

  // WebSocket integration with stable callbacks
  const { isConnected, sendMessage, requestNotificationPermission } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect,
    onError: handleWebSocketError,
  })

  useEffect(() => {
    const session = localStorage.getItem("session")
    const token = localStorage.getItem("token")

    if (session && token) {
      setUser(JSON.parse(session))
    } else {
      router.push("/auth/sign-in")
    }
  }, [router])

  // Request notification permission when user is loaded
  useEffect(() => {
    if (user) {
      // Small delay to avoid being too intrusive
      setTimeout(() => {
        if (Notification.permission === "default") {
          // NotificationPermission component will handle this
        }
      }, 2000)
    }
  }, [user])

  // Send text reminder
  const sendTextReminder = async () => {
    if (!newReminder.trim()) return

    setIsLoading(true)
    try {
      const result = await remindersAPI.create(newReminder)
      setAnswerText(result.message || "Напоминание создано!")
      setNewReminder("")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Send WebSocket message to notify about new reminder
      if (isConnected) {
        sendMessage("reminder_created", {
          text: newReminder,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      console.error("Error creating reminder:", err)
      setAnswerText(`Ошибка: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Send audio reminder
  const sendAudio = async (blob: Blob) => {
    setIsLoading(true)
    try {
      const result = await remindersAPI.create("", blob)
      setAnswerText(result.message || result.responseText || "Напоминание создано!")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Send WebSocket message to notify about new audio reminder
      if (isConnected) {
        sendMessage("audio_reminder_created", {
          type: "audio",
          timestamp: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      console.error("Error creating audio reminder:", err)
      setAnswerText(`Ошибка: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        chunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType })
          await sendAudio(blob)
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (err) {
        console.error("Recording error:", err)
        setAnswerText("Ошибка доступа к микрофону")
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("session")
    localStorage.removeItem("token")
    setUser(null)
    setShowMenu(false)
    router.push("/auth/sign-in")
  }

  const handleNotificationPermissionGranted = () => {
    console.log("Notification permission granted")
    setAnswerText("🔔 Уведомления включены!")
    setTimeout(() => setAnswerText(""), 3000)
  }

  const handleNotificationPermissionDenied = () => {
    console.log("Notification permission denied")
    setAnswerText("⚠️ Уведомления отключены")
    setTimeout(() => setAnswerText(""), 3000)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Notification Permission Prompt */}
      <NotificationPermission
        onPermissionGranted={handleNotificationPermissionGranted}
        onPermissionDenied={handleNotificationPermissionDenied}
      />

      {/* WebSocket Status Indicator */}
      <WebSocketStatus />

      <Button
        onClick={() => setShowMenu(!showMenu)}
        variant="ghost"
        size="sm"
        className="absolute top-6 left-6 z-50 w-12 h-12 p-0 rounded-2xl hover:bg-white/80 backdrop-blur-sm transition-all duration-200 shadow-lg"
      >
        <Menu className="h-6 w-6 text-slate-600" />
      </Button>
      {showMenu && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowMenu(false)} />
          <Card className="fixed top-20 left-6 w-56 border-0 shadow-2xl bg-white/95 backdrop-blur-md z-50 animate-fade-in">
            <CardContent className="p-4 space-y-2">
              <Link href="/reminders">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 px-4 rounded-xl hover:bg-blue-50"
                  onClick={() => setShowMenu(false)}
                >
                  <List className="h-5 w-5 mr-3" />
                  Reminders
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 px-4 rounded-xl hover:bg-blue-50"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-30 animate-fade-in">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-3 rounded-2xl shadow-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      )}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md space-y-12">
          {answerText && <div className="text-center text-lg font-medium text-indigo-700">{answerText}</div>}
          <div className="relative">
            <Input
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && !isRecording && sendTextReminder()}
              className="h-16 text-lg bg-white/60 backdrop-blur-sm rounded-2xl text-center shadow-lg focus:bg-white focus:shadow-xl placeholder:text-slate-400 pr-20"
              disabled={isLoading || isRecording}
              placeholder="Что нужно запомнить?"
            />
            {newReminder && (
              <Button
                onClick={sendTextReminder}
                disabled={isLoading || isRecording}
                className="absolute right-3 top-3 h-10 w-10 p-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-md flex items-center justify-center transition-all duration-200"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            )}
          </div>
          <div className="flex justify-center">
            <Button
              onClick={toggleRecording}
              disabled={isLoading}
              className={`w-32 h-32 rounded-3xl shadow-2xl transition-transform duration-300 ${isRecording ? "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"}`}
            >
              <Mic className="!h-[50px] !w-[50px] text-white" />
            </Button>
          </div>
          {isRecording && (
            <div className="flex justify-center animate-fade-in">
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse" />
                  <div className="w-1.5 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                  <div className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-1.5 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
                <span className="text-sm text-slate-700 font-medium">Recording... Tap to stop</span>
              </div>
            </div>
          )}

          {/* Connection Status Info */}
          {!isConnected && (
            <div className="text-center">
              <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">
                ⚠️ Нет подключения к серверу. Уведомления могут не работать.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
