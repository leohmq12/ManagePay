"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
}

export function BackButton({ className = "", variant = "ghost", size = "default" }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.back()}
      className={`flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  )
}
