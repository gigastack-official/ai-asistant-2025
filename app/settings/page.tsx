"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  User,
  Bell,
  MessageCircle,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Мок API ---
const mockUserAPI = {
  getProfile: async () => {
    // эмуляция задержки
    await new Promise((res) => setTimeout(res, 500));
    // возвращаем мок-данные профиля
    return {
      username: "mockuser",
      email: "mock@mock.com",
      tg_id: null,           // или строка, если уже привязан
      telegram_id: null,     // альтернативное поле
    };
  },
  linkTelegram: async (tag: string) => {
    await new Promise((res) => setTimeout(res, 500));
    // возвращаем успех и сохранённый тег
    return {
      success: true,
      tg_id: tag,
      telegram_id: tag,
    };
  },
};

const userAPI = mockUserAPI;
// --------------------

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [telegramTag, setTelegramTag] = useState("");
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("session");
    const token = localStorage.getItem("token");

    if (session && token) {
      setUser(JSON.parse(session));
      loadProfile();
    } else {
      router.push("/auth/sign-in");
    }
  }, [router]);

  const loadProfile = async () => {
    try {
      const profile = await userAPI.getProfile();
      if (profile.telegram_id || profile.tg_id) {
        setTelegramLinked(true);
      }
    } catch (err: any) {
      console.error("Error loading profile (mock):", err);
    }
  };

  const handleLinkTelegram = async (e: FormEvent) => {
    e.preventDefault();
    if (!telegramTag.trim()) return;

    setIsLinkingTelegram(true);
    setError("");
    setSuccess("");

    try {
      const cleanTag = telegramTag.replace(/^@/, "");
      await userAPI.linkTelegram(cleanTag);
      setTelegramLinked(true);
      setSuccess("Telegram успешно привязан! (mock)");
      setTelegramTag("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error linking Telegram (mock):", err);
      setError(err.message || "Ошибка привязки Telegram (mock)");
    } finally {
      setIsLinkingTelegram(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("token");
    router.push("/auth/sign-in");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-white/20 p-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="p-3 rounded-2xl hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-slate-600" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Настройки
          </h1>
          <div className="w-12" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Профиль</h3>
                <p className="text-sm text-slate-500">Информация об аккаунте</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Имя пользователя
              </label>
              <div className="mt-1 p-3 bg-slate-50 rounded-xl text-slate-600">
                {user.username || user.name}
              </div>
            </div>
            {user.email && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="mt-1 p-3 bg-slate-50 rounded-xl text-slate-600">
                  {user.email}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Telegram Integration Card */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Telegram
                </h3>
                <p className="text-sm text-slate-500">
                  Получайте уведомления в Telegram
                </p>
              </div>
              {telegramLinked && (
                <div className="ml-auto">
                  <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    <Check className="h-4 w-4" />
                    <span>Подключен</span>
                  </div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {!telegramLinked ? (
              <form
                onSubmit={handleLinkTelegram}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="telegram"
                    className="text-sm font-medium text-slate-700"
                  >
                    Telegram тег
                  </label>
                  <Input
                    id="telegram"
                    type="text"
                    value={telegramTag}
                    onChange={(e) => setTelegramTag(e.target.value)}
                    placeholder="@username или username"
                    className="mt-1 h-12 border-0 bg-gray-50 rounded-xl focus:bg-white transition-colors"
                    disabled={isLinkingTelegram}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Введите ваш Telegram тег для получения уведомлений
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg transition-all duration-200"
                  disabled={isLinkingTelegram || !telegramTag.trim()}
                >
                  {isLinkingTelegram ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Привязка...
                    </>
                  ) : (
                    "Привязать Telegram"
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-slate-600 font-medium">
                  Telegram успешно подключен! (mock)
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Теперь вы будете получать уведомления в Telegram
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Уведомления
                </h3>
                <p className="text-sm text-slate-500">
                  Настройки уведомлений
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-700">Push-уведомления</span>
                <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-700">Звуковые уведомления</span>
                <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="outline"
          className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-medium transition-all duration-200"
        >
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}

