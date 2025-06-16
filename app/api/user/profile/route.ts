import { type NextRequest, NextResponse } from "next/server"

// Mock user data
const mockUsers = {
  "550e8400-e29b-41d4-a716-446655440000": {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "user@example.com",
    name: "Test User",
    preferences: {
      notifications: true,
      voice_enabled: true,
      timezone: "Europe/Moscow",
      language: "ru",
    },
    push_token: "mock-push-token",
    telegram_chat_id: null,
    created_at: "2024-01-01T00:00:00Z",
  },
}

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    const user = mockUsers[user_id as keyof typeof mockUsers]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Mock statistics
    const statistics = {
      total: 15,
      completed: 8,
      by_category: {
        meeting: 4,
        shopping: 6,
        personal: 3,
        work: 2,
      },
    }

    return NextResponse.json({ user, statistics })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { user_id, ...updates } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    const user = mockUsers[user_id as keyof typeof mockUsers]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user data
    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // In real app, this would update the database
    mockUsers[user_id as keyof typeof mockUsers] = updatedUser

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
