import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { user_id, latitude, longitude, accuracy } = await request.json()

    if (!user_id || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Mock: Location update received", { user_id, latitude, longitude, accuracy })

    // Mock: simulate checking for nearby reminders
    const mockNearbyReminders = []

    // Simulate finding a nearby shopping reminder
    if (Math.abs(latitude - 55.7558) < 0.001 && Math.abs(longitude - 37.6176) < 0.001) {
      mockNearbyReminders.push({
        id: "rem-2",
        text: "Купить молоко",
        distance: 50,
      })

      console.log("Mock: Found nearby reminder - Купить молоко")
    }

    return NextResponse.json({
      success: true,
      message: "Mock location updated and checked for reminders",
      nearby_reminders: mockNearbyReminders,
      location: { latitude, longitude, accuracy },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
