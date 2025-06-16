import { type NextRequest, NextResponse } from "next/server"

// Import mock data (in real app this would be shared)
const mockReminders = [
  {
    id: "rem-1",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    original_text: "Напомни завтра в 9 утра о встрече",
    text: "Встреча с командой",
    category: "meeting",
    datetime: "2024-01-15T09:00:00Z",
    location: null,
    priority: "high",
    recurring: null,
    completed: false,
    conditions: { type: "time", active: true },
    created_at: "2024-01-14T10:00:00Z",
  },
]

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { id } = params
    const updates = await request.json()

    const reminderIndex = mockReminders.findIndex((r) => r.id === id)

    if (reminderIndex === -1) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    // Update reminder
    mockReminders[reminderIndex] = {
      ...mockReminders[reminderIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({ reminder: mockReminders[reminderIndex] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { id } = params

    const reminderIndex = mockReminders.findIndex((r) => r.id === id)

    if (reminderIndex === -1) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    // Remove reminder
    mockReminders.splice(reminderIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
