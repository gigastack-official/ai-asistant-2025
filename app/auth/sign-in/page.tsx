"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// --- Mock Auth API ---
const mockAuthAPI = {
  signIn: async ({
    username,
    password,
  }: {
    username: string
    password: string
  }) => {
    // эмуляция задержки
    await new Promise((res) => setTimeout(res, 500))
    // простая проверка
    if (username === "anton" && password === "Anton123") {
      return {
        token: "mock-token-12345",
        user: {
          id: "123",
          username: "anton",
          name: "Anton123",
        },
      }
    } else {
      throw new Error("Неверное имя пользователя или пароль (mock)")
    }
  },
}
// --------------------------------

export default function SignInPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const data = await mockAuthAPI.signIn({ username, password })

      // Save mock token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem(
        "session",
        JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          name: data.user.name,
        })
      )

      // Redirect to main page
      router.push("/")
    } catch (err: any) {
      console.error("Sign-in error (mock):", err)
      setError(err.message || "Ошибка входа в систему (mock)")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Добро пожаловать
          </CardTitle>
          <p className="text-slate-600 mt-2">Войдите в свой аккаунт</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Имя пользователя
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите имя пользователя"
                className="h-12 border-0 bg-gray-50 rounded-xl focus:bg-white transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Пароль
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="h-12 border-0 bg-gray-50 rounded-xl focus:bg-white transition-colors pr-12"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вход...
                </>
              ) : (
                "Войти"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-600">
              Нет аккаунта?{" "}
              <Link
                href="/auth/sign-up"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
