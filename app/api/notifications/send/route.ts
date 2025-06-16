import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const { reminder_id, user_id, type, message, channels = ["push"] } = await request.json()

    console.log("Mock: Sending notifications", { reminder_id, user_id, type, message, channels })

    const notifications = []

    for (const channel of channels) {
      // Mock successful sending for all channels
      const mockResult = {
        channel,
        status: "sent",
        timestamp: new Date().toISOString(),
        mock: true,
      }

      notifications.push(mockResult)
      console.log(`Mock: ${channel} notification sent successfully`)
    }

    return NextResponse.json({
      notifications,
      message: "Mock notifications sent successfully",
      reminder_id,
      user_id,
    })
  } catch (error: any) {
    console.error("Mock notification error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
