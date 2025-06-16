import { type NextRequest, NextResponse } from "next/server"

// Mock transcription responses
const mockTranscriptions = [
  "Напомни купить молоко завтра утром",
  "Встреча с клиентом в понедельник в 2 часа",
  "Позвонить маме на выходных",
  "Купить подарок на день рождения",
  "Записаться к врачу на следующей неделе",
  "Забрать посылку из почты",
  "Полить цветы вечером",
]

export async function POST(request: NextRequest) {
  try {
    const { audio_data, format = "webm" } = await request.json()

    if (!audio_data) {
      return NextResponse.json({ error: "Audio data required" }, { status: 400 })
    }

    // Simulate transcription delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return random mock transcription
    const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]

    return NextResponse.json({
      text: randomText,
      confidence: 0.95,
      language: "ru",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Transcription error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
