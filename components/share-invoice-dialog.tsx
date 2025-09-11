"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Copy, Mail, MessageSquare, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareInvoiceDialogProps {
  invoiceId: string
  invoiceNumber: string
  amount: number
  trigger?: React.ReactNode
}

export function ShareInvoiceDialog({ invoiceId, invoiceNumber, amount, trigger }: ShareInvoiceDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  const paymentUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${invoiceId}`
  const shortUrl = `pay.ly/${invoiceId.slice(-8)}`

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: `${type} Copied!`,
      description: "Share this with your client",
    })
  }

  const sendSMS = () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter the client's phone number",
        variant: "destructive",
      })
      return
    }

    const smsText = `Hi! Your invoice ${invoiceNumber} for $${amount.toFixed(2)} is ready. Pay securely here: ${paymentUrl}`

    // In a real app, you would integrate with an SMS service like Twilio
    console.log("Sending SMS to:", phoneNumber, "Message:", smsText)

    toast({
      title: "SMS Sent!",
      description: `Payment link sent to ${phoneNumber}`,
    })
  }

  const generateQRCode = () => {
    // In a real app, you would generate an actual QR code
    toast({
      title: "QR Code Generated!",
      description: "QR code ready for scanning",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Invoice
          </DialogTitle>
          <DialogDescription>Share invoice {invoiceNumber} with your client using multiple methods</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Payment Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={paymentUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(paymentUrl, "Link")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Short Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={shortUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(shortUrl, "Short Link")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Invoice Details</span>
                  <Badge variant="outline">{invoiceNumber}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Email Invoice</h3>
              <p className="text-sm text-muted-foreground mb-4">Send a professional email with payment link</p>
              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Compose Email
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="phone">Client Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">SMS Preview</Label>
                <p className="text-sm mt-1">
                  Hi! Your invoice {invoiceNumber} for ${amount.toFixed(2)} is ready. Pay securely here: {shortUrl}
                </p>
              </div>

              <Button onClick={sendSMS} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center py-8">
              <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">QR Code Payment</h3>
              <p className="text-sm text-muted-foreground mb-4">Generate a QR code for easy mobile payments</p>
              <Button onClick={generateQRCode} className="w-full">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
