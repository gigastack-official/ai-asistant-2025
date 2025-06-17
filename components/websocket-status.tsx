"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"

export function WebSocketStatus() {
  const [showDetails, setShowDetails] = useState(false)

  // Simple WebSocket usage without callbacks to avoid dependency issues
  const { isConnected, connectionStatus } = useWebSocket({
    autoConnect: true,
  })

  const getStatusColor = () => {
    if (isConnected) return "text-green-600"
    if (connectionStatus.reconnectAttempts > 0) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="h-4 w-4" />
    if (connectionStatus.reconnectAttempts > 0) return <AlertCircle className="h-4 w-4" />
    return <WifiOff className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (isConnected) return "Подключено"
    if (connectionStatus.reconnectAttempts > 0) return "Переподключение..."
    return "Отключено"
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Button
        onClick={() => setShowDetails(!showDetails)}
        variant="ghost"
        size="sm"
        className={`p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border-0 ${getStatusColor()}`}
      >
        {getStatusIcon()}
      </Button>

      {showDetails && (
        <Card className="absolute bottom-12 left-0 w-64 border-0 shadow-xl bg-white/95 backdrop-blur-md animate-fade-in">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">WebSocket</span>
                <span className={`text-xs font-medium ${getStatusColor()}`}>{getStatusText()}</span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div>Статус: {connectionStatus.readyState}</div>
                {connectionStatus.reconnectAttempts > 0 && <div>Попытки: {connectionStatus.reconnectAttempts}/5</div>}
              </div>

              {!isConnected && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  Уведомления могут не работать без подключения
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
