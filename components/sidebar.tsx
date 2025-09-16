"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, CreditCard, BarChart3, Settings, Building2, Plus, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Invoice Generator", icon: FileText, href: "/", current: false },
  { name: "Payment Terminal", icon: CreditCard, href: "/terminal", current: false },
  { name: "Dashboard", icon: BarChart3, href: "/dashboard", current: false },
  { name: "Companies", icon: Building2, href: "/companies", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: pathname === item.href,
  }))

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="text-xl font-bold text-sidebar-foreground">PayTerminal</h2>
            <p className="text-sm text-muted-foreground mt-1">Multi-Company Payments</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {updatedNavigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={item.current ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    item.current
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-sidebar-border">
            <Card className="p-4 bg-sidebar-accent">
              <div className="flex items-center gap-3 mb-3">
                <Plus className="h-4 w-4 text-sidebar-accent-foreground" />
                <span className="text-sm font-medium text-sidebar-accent-foreground">Quick Actions</span>
              </div>
              <div className="space-y-2">
                <Link href="/">
                  <Button size="sm" className="w-full text-xs">
                    New Invoice
                  </Button>
                </Link>
                <Link href="/terminal">
                  <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                    Payment Link
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
