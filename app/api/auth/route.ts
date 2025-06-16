import { type NextRequest, NextResponse } from "next/server"

// Mock users data
const mockUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "user@example.com",
    name: "Test User",
    preferences: {
      notifications: true,
      voice_enabled: true,
      timezone: "Europe/Moscow",
      language: "ru",
    },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "admin@example.com",
    name: "Admin User",
    preferences: {
      notifications: true,
      voice_enabled: true,
      timezone: "UTC",
      language: "en",
    },
  },
]

export async function POST(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { email, password, action } = await request.json()

    if (action === "signup") {
      // Mock signup
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        name: email.split("@")[0],
        preferences: {
          notifications: true,
          voice_enabled: true,
          timezone: "UTC",
        },
      }

      return NextResponse.json({
        user: newUser,
        session: { access_token: `mock-token-${newUser.id}` },
      })
    }

    if (action === "signin") {
      // Mock signin - find user by email
      const user = mockUsers.find((u) => u.email === email)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 })
      }

      return NextResponse.json({
        user,
        session: { access_token: `mock-token-${user.id}` },
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
