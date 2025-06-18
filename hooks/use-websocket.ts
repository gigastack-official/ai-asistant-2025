// hooks/use-websocket.ts
import { useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

export function useSocketIo({
  autoConnect = true,
  onMessage,
}: {
  autoConnect?: boolean
  onMessage: (type: string, data: any) => void
}) {
  const socketRef = useRef<Socket>()
  const [isConnected, setIsConnected] = useState(false)

  const connectSocket = ({ userId }: { userId: string }) => {
    // инициализируем один раз
    if (!socketRef.current) {
      socketRef.current = io({
        path: "/api/socketio",
        query: { userId },
        autoConnect: false,
      })
      socketRef.current.on("connect", () => setIsConnected(true))
      socketRef.current.on("disconnect", () => setIsConnected(false))
      socketRef.current.on("reminder_notification", (data) =>
        onMessage("reminder_notification", data)
      )
    }
    if (autoConnect) socketRef.current.connect()
  }

  const requestNotificationPermission = () =>
    Notification.requestPermission()

  return { connectSocket, isConnected, requestNotificationPermission }
}
