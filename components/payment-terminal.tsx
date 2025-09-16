"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Smartphone, QrCode, Link, DollarSign, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"
import { CURRENCIES, formatCurrency } from "@/lib/currencies"


interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: <CreditCard className="h-5 w-5" />,
    description: "Visa, Mastercard, American Express",
  },
  {
    id: "mobile",
    name: "Mobile Payment",
    icon: <Smartphone className="h-5 w-5" />,
    description: "Apple Pay, Google Pay, Samsung Pay",
  },
  {
    id: "qr",
    name: "QR Code",
    icon: <QrCode className="h-5 w-5" />,
    description: "Scan to pay with mobile wallet",
  },
  {
    id: "link",
    name: "Payment Link",
    icon: <Link className="h-5 w-5" />,
    description: "Send payment link via email/SMS",
  },
]

export function PaymentTerminal() {
  const { toast } = useToast()
  const router = useRouter()
  const { settings } = useAppStore()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [selectedCurrency, setSelectedCurrency] = useState(settings.defaultCurrency)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const processPayment = async () => {
    if (!amount || !description || !selectedMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would integrate with Stripe
      const paymentData = {
        amount: Number.parseFloat(amount) * 100, // Convert to cents
        currency: selectedCurrency.toLowerCase(),
        description,
        customerEmail,
        paymentMethod: selectedMethod,
      }

      console.log("Processing payment:", paymentData)

      setPaymentSuccess(true)
      toast({
        title: "Payment Successful!",
        description: `${formatCurrency(Number.parseFloat(amount), selectedCurrency)} has been processed successfully`,
      })

      // Reset form
      setAmount("")
      setDescription("")
      setCustomerEmail("")
      setSelectedMethod("")
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing the payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const generatePaymentLink = () => {
    if (!amount || !description) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and description",
        variant: "destructive",
      })
      return
    }

    const paymentUrl = `${window.location.origin}/pay/link?amount=${amount}&description=${encodeURIComponent(
      description
    )}&currency=${selectedCurrency}`
    navigator.clipboard.writeText(paymentUrl)

    toast({
      title: "Payment Link Copied!",
      description: "Share this link with your customer",
    })
  }

  const processingFee =
    Number.parseFloat(amount || "0") * settings.processingFeeRate + settings.processingFeeFixed
  const totalWithFees = Number.parseFloat(amount || "0") + processingFee

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">The payment has been processed successfully.</p>
            <Button onClick={() => setPaymentSuccess(false)} className="w-full">
              Process Another Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Terminal</h1>
        <p className="text-muted-foreground">Accept payments quickly and securely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>Enter the payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Payment for services..."
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how the customer will pay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <div className="flex-1">
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && <Badge variant="default">Selected</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      {amount && description && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Description:</span>
                <span>{description}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>{formatCurrency(Number.parseFloat(amount || "0"), selectedCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span>{formatCurrency(processingFee, selectedCurrency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(totalWithFees, selectedCurrency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={processPayment}
          disabled={isProcessing || !amount || !description || !selectedMethod}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </>
          )}
        </Button>
        <Button variant="outline" onClick={generatePaymentLink} className="w-full bg-transparent">
          <Link className="h-4 w-4 mr-2" />
          Generate Payment Link
        </Button>
      </div>
    </div>
  )
}
