"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface FloatingButtonProps {
  onClick: () => void
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary"
}

export function FloatingButton({ onClick, children, className, variant = "primary" }: FloatingButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40",
        variant === "primary" &&
          "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
        variant === "secondary" && "bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300",
        className,
      )}
    >
      {children}
    </Button>
  )
}
