"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Mic,
  Menu,
  CheckCircle2,
  List,
  Settings,
  LogOut,
  Send,
} from "lucide-react"
import Link from "next/link"

// Mocked server functionality
const mockRemindersAPI = {
  create: async (text: string = "", audio?: Blob) => {
    console.log("[Mock] Creating reminder", { text, audio })
    // simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return { message: "Напоминание создано!" }
  },
  getNotifications: async () => {
    console.log("[Mock] Fetching notifications")
    await new Promise((resolve) => setTimeout(resolve, 500))
    // return empty notifications by default
    return { notifications: [] as { message: string }[] }
  },
}

export default function ReminderApp() {
  const [newReminder, setNewReminder] = useState("")
  const [answerText, setAnswerText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  /* -------------------- Session Handling -------------------- */
  useEffect(() => {
    const session = localStorage.getItem("session")
    const token = localStorage.getItem("token")
    if (session && token) {
      setUser({ ...JSON.parse(session), token })
      Notification.requestPermission()
    } else {
      router.push("/auth/sign-in")
    }
  }, [router])

  /* -------------------- Polling every 5 seconds (mocked) -------------------- */
  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      try {
        const { notifications } = await mockRemindersAPI.getNotifications()
        notifications.forEach((n: { message: string }) => {
          if (Notification.permission === "granted") {
            new Notification("Напоминание", { body: n.message })
          }
        })
      } catch (e) {
        console.error("[Mock] Polling error:", e)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [user])

  /* -------------------- Reminders API (mocked) -------------------- */
  const sendTextReminder = async () => {
    if (!newReminder.trim()) return
    setIsLoading(true)
    try {
      const res = await mockRemindersAPI.create(newReminder)
      setAnswerText(res.message)
      setNewReminder("")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (e: any) {
      setAnswerText(`Ошибка: ${e.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const sendAudio = async (blob: Blob) => {
    setIsLoading(true)
    try {
      const res = await mockRemindersAPI.create("", blob)
      setAnswerText(res.message)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (e: any) {
      setAnswerText(`Ошибка: ${e.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  /* -------------------- Audio Recording -------------------- */
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const mr = new MediaRecorder(stream)
        mediaRecorderRef.current = mr
        chunksRef.current = []
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }
        mr.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: mr.mimeType })
          await sendAudio(blob)
        }
        mr.start()
        setIsRecording(true)
      } catch {
        setAnswerText("Ошибка доступа к микрофону")
      }
    }
  }

  /* -------------------- Logout -------------------- */
  const logout = () => {
    localStorage.removeItem("session")
    localStorage.removeItem("token")
    router.push("/auth/sign-in")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  /* -------------------- JSX -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      <Button
        onClick={() => setShowMenu((v) => !v)}
        variant="ghost"
        size="sm"
        className="absolute top-6 left-6 z-50 w-12 h-12 p-0 rounded-2xl hover:bg-white/80 backdrop-blur-sm shadow-lg"
      >
        <Menu className="h-6 w-6 text-slate-600" />
      </Button>
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowMenu(false)}
          />
          <Card className="fixed top-20 left-6 w-56 shadow-2xl bg-white/95 backdrop-blur-md z-50">
            <CardContent className="p-4 space-y-2">
              <Link href="/reminders">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 rounded-xl hover:bg-blue-50"
                  onClick={() => setShowMenu(false)}
                >
                  <List className="h-5 w-5 mr-3" /> Напоминания
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 rounded-xl hover:bg-blue-50"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings className="h-5 w-5 mr-3" /> Настройки
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="h-5 w-5 mr-3" /> Выйти
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {showSuccess && (
        <div className="fixed top-6 right-6 z-30 animate-fade-in">
          <div className="bg-green-500 text-white p-3 rounded-2xl shadow-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md space-y-12">
          {answerText && (
            <div className="text-center text-lg font-medium text-indigo-700">
              {answerText}
            </div>
          )}
          <div className="relative">
            <Input
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && !isRecording && sendTextReminder()
              }
              className="h-16 text-lg bg-white/60 backdrop-blur-sm rounded-2xl text-center shadow-lg focus:bg-white placeholder:text-slate-400 pr-20"
              disabled={isLoading || isRecording}
              placeholder="Что нужно запомнить?"
            />
            {newReminder && (
              <Button
                onClick={sendTextReminder}
                disabled={isLoading || isRecording}
                className="absolute right-3 top-3 h-10 w-10 p-0 bg-blue-500 text-white rounded-xl shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={toggleRecording}
              disabled={isLoading}
              className={`w-32 h-32 rounded-3xl shadow-2xl transition-transform ${
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <Mic className="!h-12 !w-12 text-white" />
            </Button>
          </div>

          {isRecording && (
            <div className="flex justify-center animate-fade-in">
              <div className="flex items-center space-x-3 bg-white/70 p-4 rounded-2xl shadow-lg">
                <div className="flex space-x-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-red-500 animate-pulse"
                      style={{ height: `${4 + i * 2}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-700">
                  Идет запись
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
