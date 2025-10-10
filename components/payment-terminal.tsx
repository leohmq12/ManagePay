"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Smartphone, QrCode, Link, DollarSign, Clock, CheckCircle, Copy, Loader2, User, Mail, Phone, MapPin, Calendar, Lock, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"
import { CURRENCIES, formatCurrency } from "@/lib/currencies"

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  enabled: boolean
  fields: string[]
}

interface CardDetails {
  number: string
  name: string
  expiry: string
  cvc: string
  saveCard: boolean
}

interface MobilePaymentDetails {
  provider: string
  phone: string
}

interface QrDetails {
  type: string
  note: string
}

interface LinkDetails {
  sendMethod: string
  message: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: <CreditCard className="h-5 w-5" />,
    description: "Visa, Mastercard, American Express",
    enabled: true,
    fields: ["cardNumber", "cardName", "expiry", "cvc", "saveCard"]
  },
  {
    id: "mobile",
    name: "Mobile Payment",
    icon: <Smartphone className="h-5 w-5" />,
    description: "Apple Pay, Google Pay, Samsung Pay",
    enabled: true,
    fields: ["provider", "phone"]
  },
  {
    id: "qr",
    name: "QR Code",
    icon: <QrCode className="h-5 w-5" />,
    description: "Scan to pay with mobile wallet",
    enabled: true,
    fields: ["type", "note"]
  },
  {
    id: "link",
    name: "Payment Link",
    icon: <Link className="h-5 w-5" />,
    description: "Send payment link via email/SMS",
    enabled: true,
    fields: ["sendMethod", "message"]
  },
]

export function PaymentTerminal() {
  const { toast } = useToast()
  const router = useRouter()
  const { settings, addTransaction } = useAppStore()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [selectedCurrency, setSelectedCurrency] = useState(settings.defaultCurrency)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [generatedLink, setGeneratedLink] = useState("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [transactionId, setTransactionId] = useState("")

  // Payment method specific states
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
    saveCard: false
  })
  const [mobileDetails, setMobileDetails] = useState<MobilePaymentDetails>({
    provider: "",
    phone: ""
  })
  const [qrDetails, setQrDetails] = useState<QrDetails>({
    type: "upi",
    note: ""
  })
  const [linkDetails, setLinkDetails] = useState<LinkDetails>({
    sendMethod: "email",
    message: "Please make your payment using the following link:"
  })

  // Calculate fees whenever amount or currency changes
  const processingFee = Number.parseFloat(amount || "0") * settings.processingFeeRate + settings.processingFeeFixed
  const totalWithFees = Number.parseFloat(amount || "0") + processingFee

  // Generate a transaction ID when component mounts
  useEffect(() => {
    setTransactionId(generateTransactionId())
  }, [])

  // Reset transaction ID when starting a new payment
  useEffect(() => {
    if (!paymentSuccess && !isProcessing && !amount) {
      setTransactionId(generateTransactionId())
    }
  }, [paymentSuccess, isProcessing, amount])

  const generateTransactionId = () => {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const validateForm = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return false
    }

    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a payment description",
        variant: "destructive",
      })
      return false
    }

    if (!selectedMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return false
    }

    // Validate method-specific fields
    if (selectedMethod === "card") {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
        toast({
          title: "Invalid Card Number",
          description: "Please enter a valid card number",
          variant: "destructive",
        })
        return false
      }
      if (!cardDetails.name) {
        toast({
          title: "Missing Cardholder Name",
          description: "Please enter the cardholder name",
          variant: "destructive",
        })
        return false
      }
      if (!cardDetails.expiry || !/\d{2}\/\d{2}/.test(cardDetails.expiry)) {
        toast({
          title: "Invalid Expiry Date",
          description: "Please enter a valid expiry date (MM/YY)",
          variant: "destructive",
        })
        return false
      }
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        toast({
          title: "Invalid CVC",
          description: "Please enter a valid CVC code",
          variant: "destructive",
        })
        return false
      }
    }

    if (selectedMethod === "mobile" && !mobileDetails.phone) {
      toast({
        title: "Missing Phone Number",
        description: "Please enter a phone number",
        variant: "destructive",
      })
      return false
    }

    if (selectedMethod === "link" && linkDetails.sendMethod === "email" && !customerEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter a customer email to send the payment link",
        variant: "destructive",
      })
      return false
    }

    if (selectedMethod === "link" && linkDetails.sendMethod === "sms" && !customerPhone) {
      toast({
        title: "Missing Phone Number",
        description: "Please enter a customer phone number to send the payment link",
        variant: "destructive",
      })
      return false
    }

    if (customerEmail && !/\S+@\S+\.\S+/.test(customerEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const processPayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Simulate API call to payment processor
      await new Promise((resolve, reject) => {
        // Simulate 10% failure rate for demo purposes
        if (Math.random() < 0.1) {
          setTimeout(() => reject(new Error("Payment declined by bank")), 2000)
        } else {
          setTimeout(resolve, 2000)
        }
      })

      const paymentData = {
        id: transactionId,
        amount: Number.parseFloat(amount),
        currency: selectedCurrency,
        description,
        customerEmail,
        customerName,
        customerPhone,
        paymentMethod: selectedMethod,
        status: "completed",
        date: new Date().toISOString(),
        processingFee,
        totalWithFees,
        methodDetails: selectedMethod === "card" ? cardDetails : 
                      selectedMethod === "mobile" ? mobileDetails :
                      selectedMethod === "qr" ? qrDetails : linkDetails
      }

      // Save to store
      addTransaction(paymentData)

      setPaymentSuccess(true)
      toast({
        title: "Payment Successful!",
        description: `${formatCurrency(Number.parseFloat(amount), selectedCurrency)} has been processed successfully`,
      })
    } catch (error) {
      console.error("Payment processing error:", error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "There was an error processing the payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const generatePaymentLink = async () => {
    if (!amount || Number.parseFloat(amount) <= 0 || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a valid amount and description",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingLink(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      

      const paymentUrl = `${window.location.origin}/terminal`

      setGeneratedLink(paymentUrl)
      navigator.clipboard.writeText(paymentUrl)

      toast({
        title: "Payment Link Generated!",
        description: "The link has been copied to your clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate payment link",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const resetForm = () => {
    setAmount("")
    setDescription("")
    setCustomerEmail("")
    setCustomerName("")
    setCustomerPhone("")
    setSelectedMethod("")
    setGeneratedLink("")
    setPaymentSuccess(false)
    setCardDetails({
      number: "",
      name: "",
      expiry: "",
      cvc: "",
      saveCard: false
    })
    setMobileDetails({
      provider: "",
      phone: ""
    })
    setQrDetails({
      type: "upi",
      note: ""
    })
    setLinkDetails({
      sendMethod: "email",
      message: "Please make your payment using the following link:"
    })
    setTransactionId(generateTransactionId())
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2)}`
    }
    return value
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              {formatCurrency(Number.parseFloat(amount), selectedCurrency)} has been processed successfully.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg text-left mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Transaction ID:</span>
                <span className="font-mono">{transactionId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Payment Method:</span>
                <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={resetForm} className="flex-1">
                Process Another Payment
              </Button>
             
            </div>
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
              <Label htmlFor="customerName">Customer Name </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Customer Email </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Customer Phone </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
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
              {paymentMethods.filter(method => method.enabled).map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <div className="flex-1">
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && <Badge className="bg-blue-500">Selected</Badge>}
                  </div>
                </div>
              ))}
            </div>

            {/* Method-specific fields */}
            {selectedMethod === "card" && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date (MM/YY) *</Label>
                      <Input
                        id="expiry"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: formatExpiryDate(e.target.value)})}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC *</Label>
                      <Input
                        id="cvc"
                        type="password"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '')})}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="saveCard" 
                      checked={cardDetails.saveCard}
                      onChange={(e) => setCardDetails({...cardDetails, saveCard: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="saveCard" className="text-sm">Save card for future payments</Label>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Your card details are encrypted and secure
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "mobile" && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Payment Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="provider">Payment Provider</Label>
                    <Select 
                      value={mobileDetails.provider} 
                      onValueChange={(value) => setMobileDetails({...mobileDetails, provider: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apple">Apple Pay</SelectItem>
                        <SelectItem value="google">Google Pay</SelectItem>
                        <SelectItem value="samsung">Samsung Pay</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={mobileDetails.phone}
                      onChange={(e) => setMobileDetails({...mobileDetails, phone: e.target.value})}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "qr" && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Code Details
                </h4>
                <div className="space-y-4">
                 
                  <div>
                    <Label htmlFor="note">Payment Note (Optional)</Label>
                    <Input
                      id="note"
                      value={qrDetails.note}
                      onChange={(e) => setQrDetails({...qrDetails, note: e.target.value})}
                      placeholder="Payment for invoice #123"
                    />
                  </div>
                  <div className="p-3 bg-gray-100 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Show QR code to customer for scanning</p>
                    <div className="mt-2 flex justify-center">
                      <div className="w-32 h-32 border-4 border-gray-300 flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "link" && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Payment Link Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sendMethod">Send Via</Label>
                    <Select 
                      value={linkDetails.sendMethod} 
                      onValueChange={(value) => setLinkDetails({...linkDetails, sendMethod: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="both">Both Email and SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message to Customer</Label>
                    <textarea
                      id="message"
                      value={linkDetails.message}
                      onChange={(e) => setLinkDetails({...linkDetails, message: e.target.value})}
                      placeholder="Enter a message to include with the payment link"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {(linkDetails.sendMethod === "email" || linkDetails.sendMethod === "both") && !customerEmail && (
                    <div className="p-3 bg-yellow-100 rounded-md text-yellow-800 text-sm">
                      Please enter customer email above to send payment link
                    </div>
                  )}
                  {(linkDetails.sendMethod === "sms" || linkDetails.sendMethod === "both") && !customerPhone && (
                    <div className="p-3 bg-yellow-100 rounded-md text-yellow-800 text-sm">
                      Please enter customer phone number above to send payment link
                    </div>
                  )}
                </div>
              </div>
            )}
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
                <span className="font-medium">{description}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>{formatCurrency(Number.parseFloat(amount || "0"), selectedCurrency)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing Fee ({settings.processingFeeRate * 100}% + {formatCurrency(settings.processingFeeFixed, selectedCurrency)}):</span>
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

      {/* Generated Link Display */}
      {generatedLink && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Generated Payment Link</CardTitle>
            <CardDescription>Share this link with your customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={generatedLink} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>All payments are secure and encrypted</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-4">
        <Button
          onClick={processPayment}
          disabled={isProcessing || !amount || !description || !selectedMethod}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </>
          )}
        </Button>
        
      </div>

      {/* Transaction ID */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Transaction ID: {transactionId}
      </div>
    </div>
  )
}