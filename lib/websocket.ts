interface WebSocketMessage {
  type: string
  data: any
  timestamp?: string
}

interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnected = false
  private listeners: Map<string, Function[]> = new Map()

  constructor() {
    this.connect()
  }

  private connect() {
    const token = this.getAuthToken()
    if (!token) {
      console.warn("No auth token found, skipping WebSocket connection")
      return
    }

    try {
      // WebSocket URL with auth token
      const wsUrl = `wss://192.168.100.58:8443/ws`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit("connected", {})
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log("WebSocket message received:", message)
          this.handleMessage(message)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        this.isConnected = false
        this.emit("disconnected", { code: event.code, reason: event.reason })
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.emit("error", error)
      }
    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
      this.handleReconnect()
    }
  }

  private handleMessage(message: WebSocketMessage) {
    // Emit the message to all listeners
    this.emit(message.type, message.data)

    // Handle specific message types
    switch (message.type) {
      case "reminder_notification":
        this.handleReminderNotification(message.data)
        break
      case "reminder_created":
        this.handleReminderCreated(message.data)
        break
      case "reminder_updated":
        this.handleReminderUpdated(message.data)
        break
      case "system_notification":
        this.handleSystemNotification(message.data)
        break
      default:
        console.log("Unknown message type:", message.type)
    }
  }

  private async handleReminderNotification(data: any) {
    const notification: NotificationData = {
      title: "🔔 Напоминание",
      body: data.text || data.message || "У вас есть новое напоминание",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: `reminder-${data.id}`,
      data: {
        type: "reminder",
        reminderId: data.id,
        url: "/reminders",
      },
    }

    await this.showNotification(notification)
  }

  private async handleReminderCreated(data: any) {
    const notification: NotificationData = {
      title: "✅ Напоминание создано",
      body: data.text || "Новое напоминание успешно создано",
      icon: "/icon-192x192.png",
      tag: `created-${data.id}`,
      data: {
        type: "reminder_created",
        reminderId: data.id,
        url: "/reminders",
      },
    }

    await this.showNotification(notification)
  }

  private async handleReminderUpdated(data: any) {
    if (data.completed) {
      const notification: NotificationData = {
        title: "✅ Напоминание выполнено",
        body: data.text || "Напоминание отмечено как выполненное",
        icon: "/icon-192x192.png",
        tag: `completed-${data.id}`,
        data: {
          type: "reminder_completed",
          reminderId: data.id,
          url: "/reminders",
        },
      }

      await this.showNotification(notification)
    }
  }

  private async handleSystemNotification(data: any) {
    const notification: NotificationData = {
      title: data.title || "Системное уведомление",
      body: data.message || data.body || "У вас есть новое уведомление",
      icon: "/icon-192x192.png",
      tag: `system-${Date.now()}`,
      data: {
        type: "system",
        url: data.url || "/",
      },
    }

    await this.showNotification(notification)
  }

  private async showNotification(notificationData: NotificationData) {
    // Check if notifications are supported and permitted
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return
    }

    // Request permission if not already granted
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        console.warn("Notification permission denied")
        return
      }
    }

    if (Notification.permission !== "granted") {
      console.warn("Notifications not permitted")
      return
    }

    // Show the notification
    try {
      const notification = new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data,
        requireInteraction: true,
        silent: false,
      })

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()

        // Navigate to the specified URL if provided
        if (notificationData.data?.url) {
          window.location.href = notificationData.data.url
        }

        notification.close()
      }

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close()
      }, 10000)
    } catch (error) {
      console.error("Error showing notification:", error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(
        `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      )

      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error("Max reconnection attempts reached")
      this.emit("max_reconnect_attempts", {})
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  }

  // Event listener management
  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Send message to server
  public send(message: WebSocketMessage) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket not connected, cannot send message")
    }
  }

  // Connection status
  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.ws?.readyState,
    }
  }

  // Disconnect
  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.listeners.clear()
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications")
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null

export const getWebSocketManager = (): WebSocketManager => {
  if (!wsManager) {
    wsManager = new WebSocketManager()
  }
  return wsManager
}

export const disconnectWebSocket = () => {
  if (wsManager) {
    wsManager.disconnect()
    wsManager = null
  }
}

export type { WebSocketMessage, NotificationData }
