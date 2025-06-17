"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { getWebSocketManager, disconnectWebSocket } from "@/lib/websocket"

interface UseWebSocketOptions {
  autoConnect?: boolean
  onMessage?: (type: string, data: any) => void
  onConnect?: () => void
  onDisconnect?: (event: { code: number; reason: string }) => void
  onError?: (error: any) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<any>({})
  const wsManagerRef = useRef<any>(null)

  // Use refs for callbacks to avoid dependency issues
  const onMessageRef = useRef(options.onMessage)
  const onConnectRef = useRef(options.onConnect)
  const onDisconnectRef = useRef(options.onDisconnect)
  const onErrorRef = useRef(options.onError)

  // Update refs when options change
  useEffect(() => {
    onMessageRef.current = options.onMessage
    onConnectRef.current = options.onConnect
    onDisconnectRef.current = options.onDisconnect
    onErrorRef.current = options.onError
  }, [options.onMessage, options.onConnect, options.onDisconnect, options.onError])

  // Stable callback functions
  const handleConnect = useCallback(() => {
    setIsConnected(true)
    onConnectRef.current?.()
  }, [])

  const handleDisconnect = useCallback((event: { code: number; reason: string }) => {
    setIsConnected(false)
    onDisconnectRef.current?.(event)
  }, [])

  const handleError = useCallback((error: any) => {
    onErrorRef.current?.(error)
  }, [])

  const handleReminderNotification = useCallback((data: any) => {
    onMessageRef.current?.("reminder_notification", data)
  }, [])

  const handleReminderCreated = useCallback((data: any) => {
    onMessageRef.current?.("reminder_created", data)
  }, [])

  const handleReminderUpdated = useCallback((data: any) => {
    onMessageRef.current?.("reminder_updated", data)
  }, [])

  const handleSystemNotification = useCallback((data: any) => {
    onMessageRef.current?.("system_notification", data)
  }, [])

  useEffect(() => {
    if (!autoConnect) return

    // Get WebSocket manager instance
    wsManagerRef.current = getWebSocketManager()

    // Register event listeners
    wsManagerRef.current.on("connected", handleConnect)
    wsManagerRef.current.on("disconnected", handleDisconnect)
    wsManagerRef.current.on("error", handleError)
    wsManagerRef.current.on("reminder_notification", handleReminderNotification)
    wsManagerRef.current.on("reminder_created", handleReminderCreated)
    wsManagerRef.current.on("reminder_updated", handleReminderUpdated)
    wsManagerRef.current.on("system_notification", handleSystemNotification)

    // Update connection status once
    const updateStatus = () => {
      if (wsManagerRef.current) {
        setConnectionStatus(wsManagerRef.current.getConnectionStatus())
      }
    }

    updateStatus()
    const statusInterval = setInterval(updateStatus, 5000) // Less frequent updates

    // Cleanup
    return () => {
      clearInterval(statusInterval)

      if (wsManagerRef.current) {
        wsManagerRef.current.off("connected", handleConnect)
        wsManagerRef.current.off("disconnected", handleDisconnect)
        wsManagerRef.current.off("error", handleError)
        wsManagerRef.current.off("reminder_notification", handleReminderNotification)
        wsManagerRef.current.off("reminder_created", handleReminderCreated)
        wsManagerRef.current.off("reminder_updated", handleReminderUpdated)
        wsManagerRef.current.off("system_notification", handleSystemNotification)
      }
    }
  }, [
    autoConnect,
    handleConnect,
    handleDisconnect,
    handleError,
    handleReminderNotification,
    handleReminderCreated,
    handleReminderUpdated,
    handleSystemNotification,
  ])

  // Send message function
  const sendMessage = useCallback((type: string, data: any) => {
    if (wsManagerRef.current) {
      wsManagerRef.current.send({ type, data, timestamp: new Date().toISOString() })
    }
  }, [])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (wsManagerRef.current) {
      return await wsManagerRef.current.requestNotificationPermission()
    }
    throw new Error("WebSocket manager not initialized")
  }, [])

  const disconnect = useCallback(() => {
    disconnectWebSocket()
  }, [])

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    requestNotificationPermission,
    disconnect,
  }
}
