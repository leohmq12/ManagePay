// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // only read theme on client after mount to avoid hydration mismatch
  const isDark = mounted ? (resolvedTheme || theme) === "dark" : false;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account */}
        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar src="/hmq.jpeg" alt="Profile" />

              <div>
                <h2 className="text-xl font-semibold">Account</h2>
                <p className="text-sm text-gray-500">Manage your personal information</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Name</span>
                <span className="text-gray-600">Hafiz Qamar</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Email</span>
                <span className="text-gray-600">hafizqamar07@gmail.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Password</span>
                <span className="text-gray-600">********</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Edit Account
            </Button>
          </CardContent>
        </Card>

        {/* UI Preferences */}
        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Appearance</h2>
            <p className="text-sm text-gray-500">Customize the look and feel of the app.</p>
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-sm text-gray-500">Control how you receive alerts.</p>
            <div className="flex items-center justify-between">
              <span>Email Receipts</span>
              <Switch checked={emailReceipts} onCheckedChange={setEmailReceipts} />
            </div>
          </CardContent>
        </Card>

        {/* General */}
        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">General</h2>
            <p className="text-sm text-gray-500">Application details and support.</p>
            <Button className="w-full">Help & Support</Button>
            <Button variant="outline" className="w-full">
              About App
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
