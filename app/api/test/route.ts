import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Mock API is working",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      reminders: "/api/reminders",
      voice: "/api/voice/transcribe",
      notifications: "/api/notifications/send",
      webhooks: "/api/webhooks/n8n",
      location: "/api/location/update",
      profile: "/api/user/profile",
    },
  })
}
