"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Menu, CheckCircle2, List, Settings, LogOut, Send } from "lucide-react"
import Link from "next/link"

export default function ReminderApp() {
  const [newReminder, setNewReminder] = useState("")
  const [recognizedText, setRecognizedText] = useState<string>("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const session = localStorage.getItem("session")
    if (session) setUser(JSON.parse(session))
  }, [])

  const createReminder = async (text: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, user_id: user?.id }),
      })
      const data = await res.json()
      if (data.reminder) {
        setNewReminder("")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2500)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const startWebSocket = () => {
    const ws = new WebSocket("ws://gigafs.v6.navy:8881/ws")
    ws.binaryType = "arraybuffer"

    ws.onopen = () => console.log("WS open")

    ws.onmessage = (evt) => {
      if (typeof evt.data === 'string') {
        const raw = evt.data.trim()
        // intermediate JSON array [text, timestamp]
        if (raw.startsWith("[") && raw.endsWith("]")) {
          try {
            const [text, timestamp] = JSON.parse(raw) as [string, number]
            console.log("Intermediate @", timestamp)
            setRecognizedText(prev => prev + (prev ? ' ' : '') + text)
            createReminder(text)
          } catch (e) {
            console.warn("WS parse error", e)
          }
        } else {
          // plain text
          console.log("Received text:", raw)
          setRecognizedText(prev => prev + (prev ? ' ' : '') + raw)
          createReminder(raw)
        }
      }
    }

    ws.onerror = (e) => console.error("WS error", e)
    ws.onclose = () => console.log("WS closed")
    wsRef.current = ws
  }

  const toggleRecording = async () => {
    if (isRecording) {
      processorRef.current?.disconnect()
      sourceRef.current?.disconnect()
      audioContextRef.current?.close()
      streamRef.current?.getTracks().forEach(track => track.stop())
      setIsRecording(false)

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: "stop" }))
        wsRef.current.close()
      }
    } else {
      try {
        setRecognizedText("")
        startWebSocket()

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const audioCtx = new AudioContext({ sampleRate: 16000 })
        audioContextRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(stream)
        sourceRef.current = source
        const processor = audioCtx.createScriptProcessor(4096, 1, 1)
        processorRef.current = processor

        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0)
          const pcm16 = new Int16Array(input.length)
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]))
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
          }
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(pcm16.buffer)
          }
        }

        source.connect(processor)
        processor.connect(audioCtx.destination)
        setIsRecording(true)
      } catch (err) {
        console.error("Recording error:", err)
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("session")
    setUser(null)
    setShowMenu(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <Input placeholder="Email" type="email" className="h-12 border-0 bg-gray-50 rounded-xl focus:bg-white transition-colors" />
            <Input placeholder="Password" type="password" className="h-12 border-0 bg-gray-50 rounded-xl focus:bg-white transition-colors" />
            <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg transition-all duration-200" onClick={() => {
              const mockUser = { id: "550e8400-e29b-41d4-a716-446655440000", email: "user@example.com" }
              setUser(mockUser)
              localStorage.setItem("session", JSON.stringify(mockUser))
            }}>Continue</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      <Button onClick={() => setShowMenu(!showMenu)} variant="ghost" size="sm" className="absolute top-6 left-6 z-50 w-12 h-12 p-0 rounded-2xl hover:bg-white/80 backdrop-blur-sm transition-all duration-200 shadow-lg">
        <Menu className="h-6 w-6 text-slate-600" />
      </Button>
      {showMenu && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowMenu(false)} />
          <Card className="fixed top-20 left-6 w-56 border-0 shadow-2xl bg-white/95 backdrop-blur-md z-50 animate-fade-in">
            <CardContent className="p-4 space-y-2">
              <Link href="/reminders"><Button variant="ghost" className="w-full justify-start h-12 px-4 rounded-xl hover:bg-blue-50" onClick={() => setShowMenu(false)}><List className="h-5 w-5 mr-3"/>Reminders</Button></Link>
              <Button variant="ghost" className="w-full justify-start h-12 px-4 rounded-xl hover:bg-blue-50"><Settings className="h-5 w-5 mr-3"/>Settings</Button>
              <Button variant="ghost" className="w-full justify-start h-12 px-4 rounded-xl hover:bg-red-50" onClick={logout}><LogOut className="h-5 w-5 mr-3"/>Logout</Button>
            </CardContent>
          </Card>
        </>
      )}
      {showSuccess && (<div className="fixed top-6 right-6 z-30 animate-fade-in"><div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-3 rounded-2xl shadow-lg"><CheckCircle2 className="h-6 w-6"/></div></div>)}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md space-y-12">
          {recognizedText && <div className="text-center text-lg font-medium text-indigo-700">{recognizedText}</div>}
          <div className="relative">
            <Input value={newReminder} onChange={e => setNewReminder(e.target.value)} onKeyPress={e => e.key==="Enter"&&!isLoading&&!isRecording&&createReminder(newReminder)} className="h-16 text-lg bg-white/60 backdrop-blur-sm rounded-2xl text-center shadow-lg focus:bg-white focus:shadow-xl placeholder:text-slate-400 pr-20" disabled={isLoading||isRecording} placeholder="Что нужно запомнить?"/>
            {newReminder&&<Button onClick={()=>createReminder(newReminder)} disabled={isLoading} className="absolute right-3 top-3 h-10 w-10 p-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-md flex items-center justify-center transition-all duration-200">{isLoading?<div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin"/>:<Send className="h-4 w-4 text-white"/>}</Button>}
          </div>
          <div className="flex justify-center">
            <Button onClick={toggleRecording} disabled={isLoading} className={`w-32 h-32 rounded-3xl shadow-2xl transition-transform duration-300 ${isRecording?"bg-gradient-to-r from-red-500 to-pink-500 animate-pulse":"bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"}`}><Mic className="!h-[50px] !w-[50px] text-white"/></Button>
          </div>
          {isRecording&&<div className="flex justify-center animate-fade-in"><div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg"><div className="flex space-x-1"><div className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse"/><div className="w-1.5 h-6 bg-red-500 rounded-full animate-pulse" style={{animationDelay:"0.1s"}}/><div className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse" style={{animationDelay:"0.2s"}}/><div className="w-1.5 h-5 bg-red-500 rounded-full animate-pulse" style={{animationDelay:"0.3s"}}/></div><span className="text-sm text-slate-700 font-medium">Recording... Tap to stop</span></div></div>}
        </div>
      </div>
    </div>
  )
}
