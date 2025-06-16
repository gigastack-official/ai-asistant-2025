import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const payload = await request.json()
    const { action, reminder_id, notification_type, user_id } = payload

    console.log("Mock n8n webhook received:", { action, reminder_id, user_id })

    switch (action) {
      case "send_notification":
        console.log(`Mock: Sending ${notification_type} notification for reminder ${reminder_id}`)
        break

      case "location_trigger":
        const { latitude, longitude } = payload
        console.log(`Mock: Location trigger at ${latitude}, ${longitude} for user ${user_id}`)

        // Mock: simulate finding nearby reminders
        const mockNearbyReminders = [{ id: "rem-2", text: "Купить молоко", distance: 50 }]

        console.log("Mock: Found nearby reminders:", mockNearbyReminders)
        break

      case "schedule_reminder":
        console.log(`Mock: Scheduling reminder ${reminder_id}`)
        break

      default:
        console.log("Mock: Unknown webhook action:", action)
    }

    return NextResponse.json({
      success: true,
      processed: action,
      mock: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Mock webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
