import { type NextRequest, NextResponse } from "next/server"

// Mock reminders data
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
  {
    id: "rem-2",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    original_text: "Купить молоко в магазине",
    text: "Купить молоко",
    category: "shopping",
    datetime: null,
    location: {
      name: "Магазин у дома",
      latitude: 55.7558,
      longitude: 37.6176,
      radius: 100,
    },
    priority: "medium",
    recurring: null,
    completed: false,
    conditions: { type: "location", active: true },
    created_at: "2024-01-14T11:00:00Z",
  },
  {
    id: "rem-3",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    original_text: "Позвонить врачу на следующей неделе",
    text: "Позвонить врачу",
    category: "health",
    datetime: "2024-01-20T10:00:00Z",
    location: null,
    priority: "high",
    recurring: null,
    completed: true,
    conditions: { type: "time", active: true },
    created_at: "2024-01-13T15:00:00Z",
  },
]

// Mock AI parsing function
function mockParseReminder(text: string) {
  // Simple keyword-based parsing
  const categories = {
    встреча: "meeting",
    купить: "shopping",
    врач: "health",
    работа: "work",
    звонок: "personal",
  }

  let category = "other"
  for (const [keyword, cat] of Object.entries(categories)) {
    if (text.toLowerCase().includes(keyword)) {
      category = cat
      break
    }
  }

  // Extract time mentions
  let datetime = null
  if (text.includes("завтра")) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    datetime = tomorrow.toISOString()
  } else if (text.includes("неделе")) {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    datetime = nextWeek.toISOString()
  }

  // Extract location
  let location = null
  if (text.includes("магазин")) {
    location = {
      name: "Ближайший магазин",
      latitude: 55.7558 + (Math.random() - 0.5) * 0.01,
      longitude: 37.6176 + (Math.random() - 0.5) * 0.01,
      radius: 100,
    }
  }

  return {
    text: text,
    category,
    datetime,
    location,
    priority: datetime ? "high" : "medium",
    recurring: null,
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const { text, user_id, voice_data } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    let processedText = text

    // Mock voice transcription
    if (voice_data) {
      // Simulate transcription delay
      await new Promise((resolve) => setTimeout(resolve, 2000))
      processedText = "Напомни купить хлеб завтра утром" // Mock transcribed text
    }

    // Mock AI parsing
    const parsedReminder = mockParseReminder(processedText)

    // Create new reminder
    const newReminder = {
      id: `rem-${Date.now()}`,
      user_id,
      original_text: processedText,
      text: parsedReminder.text,
      category: parsedReminder.category,
      datetime: parsedReminder.datetime,
      location: parsedReminder.location,
      priority: parsedReminder.priority,
      recurring: parsedReminder.recurring,
      completed: false,
      conditions: {
        type: parsedReminder.location ? "location" : "time",
        active: true,
      },
      created_at: new Date().toISOString(),
    }

    // Add to mock data
    mockReminders.unshift(newReminder)

    return NextResponse.json({
      reminder: newReminder,
      parsed: parsedReminder,
    })
  } catch (error: any) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const category = searchParams.get("category")
    const completed = searchParams.get("completed")
    const location = searchParams.get("location")

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    let filteredReminders = mockReminders.filter((r) => r.user_id === user_id)

    if (category) {
      filteredReminders = filteredReminders.filter((r) => r.category === category)
    }

    if (completed !== null) {
      filteredReminders = filteredReminders.filter((r) => r.completed === (completed === "true"))
    }

    if (location) {
      filteredReminders = filteredReminders.filter((r) => r.location !== null)
    }

    return NextResponse.json({ reminders: filteredReminders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
