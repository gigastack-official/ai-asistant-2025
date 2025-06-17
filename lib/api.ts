const API_BASE_URL = "https://192.168.100.58:8443/api/v1"
const N8N = "https://n8n.gigafs.v6.navy"


// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Create authenticated fetch wrapper
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Auth API functions
export const authAPI = {
  signIn: async (username: string, password: string) => {
    return apiRequest("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  },

  signUp: async (username: string, password: string) => {
    return apiRequest("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  },
}

// Reminders API functions
export const remindersAPI = {
  create: async (text: string, audioBlob?: Blob) => {
    const token = getAuthToken()

    if (audioBlob) {
      // Send audio data
      const formData = new FormData()
      formData.append("audio", audioBlob, "reminder.webm")
      formData.append("type", "audio")

      const response = await fetch(`https://n8n.gigafs.v6.navy/webhook/74e3f1ab-0098-45ac-b989-e2a7c45ba87c`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      return response.json()
    } else {
      // Send text data
      return apiRequest("/reminders", {
        method: "POST",
        body: JSON.stringify({ text }),
      })
    }
  },

  getAll: async () => {
    return apiRequest("/reminders")
  },

  getUpcoming: async () => {
    return apiRequest("/reminders/upcoming")
  },

  update: async (id: string, updates: any) => {
    return apiRequest(`/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/reminders/${id}`, {
      method: "DELETE",
    })
  },
}

// User API functions
export const userAPI = {
  getProfile: async () => {
    return apiRequest("/user/profile")
  },

  updateProfile: async (updates: any) => {
    return apiRequest("/user/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  },

  linkTelegram: async (tgId: string) => {
    return apiRequest(`/profile/tg-id?tgId=${encodeURIComponent(tgId)}`, {
      method: "POST",
    })
  },
}
