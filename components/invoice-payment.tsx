"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Building2, Mail, Calendar, CheckCircle, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from  "@/components/ui/back-button"
import { useAppStore } from "@/lib/store"
import { formatCurrency } from "@/lib/currencies"

interface InvoiceData {
  id: string
  invoiceNumber: string
  company: {
    name: string
    email: string
    address: string
  }
  client: {
    name: string
    email: string
    address: string
  }
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  subtotal: number
  tax: number
  total: number
  currency: string
  dueDate: string
  status: "pending" | "paid" | "overdue"
  notes?: string
}

interface InvoicePaymentProps {
  invoiceId: string
}

export function InvoicePayment({ invoiceId }: InvoicePaymentProps) {
  const { toast } = useToast()
  const { companies, settings } = useAppStore()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")

  useEffect(() => {
    // Simulate loading invoice data
    const loadInvoice = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const company =
        companies.length > 0
          ? companies[0]
          : {
              id: "1",
              name: "Sample Company",
              email: "billing@sample.com",
              address: "123 Business St, City, State 12345",
              isActive: true,
              createdAt: new Date().toISOString().split("T")[0],
              stats: { totalRevenue: 0, invoiceCount: 0, clientCount: 0 },
            }

      const mockInvoice: InvoiceData = {
        id: invoiceId,
        invoiceNumber: `INV-${invoiceId}`,
        company: {
          name: company.name,
          email: company.email,
          address: company.address,
        },
        client: {
          name: "John Doe",
          email: "john@example.com",
          address: "456 Client Ave, New York, NY 10001",
        },
        items: [
          {
            description: "Web Development Services",
            quantity: 40,
            rate: 75,
            amount: 3000,
          },
          {
            description: "UI/UX Design",
            quantity: 20,
            rate: 85,
            amount: 1700,
          },
        ],
        subtotal: 4700,
        tax: 470,
        total: 5170,
        currency: settings.defaultCurrency,
        dueDate: "2024-02-15",
        status: "pending",
        notes: "Payment due within 30 days. Thank you for your business!",
      }

      setInvoice(mockInvoice)
      setIsLoading(false)
    }

    loadInvoice()
  }, [invoiceId, companies, settings])

  const processPayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing with Stripe
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setPaymentSuccess(true)
      toast({
        title: "Payment Successful!",
        description: `Invoice ${invoice?.invoiceNumber} has been paid successfully`,
      })
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <BackButton />
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <BackButton />
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground">The invoice you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <BackButton />
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Your payment for invoice {invoice.invoiceNumber} has been processed successfully.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.total, invoice.currency)}</p>
            </div>
            <p className="text-sm text-muted-foreground">A receipt has been sent to your email address.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <BackButton />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Pay Invoice</h1>
        <p className="text-muted-foreground">Complete your payment securely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoice Details</span>
                <Badge variant={invoice.status === "pending" ? "secondary" : "default"}>
                  {invoice.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{invoice.company.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.company.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{invoice.company.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">Invoice #{invoice.invoiceNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.rate, invoice.currency)}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.amount, invoice.currency)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(invoice.tax, invoice.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Secure Payment
            </CardTitle>
            <CardDescription>Your payment information is encrypted and secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" maxLength={4} />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Amount to Pay:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Powered by Stripe • Your payment is secure and encrypted</p>
            </div>

            <Button onClick={processPayment} disabled={isProcessing} className="w-full" size="lg">
              {isProcessing ? (
                <>
                  <CreditCard className="h-4 w-4 mr-2 animate-pulse" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {formatCurrency(invoice.total, invoice.currency)}
                </>
              )}
            </Button>

            {invoice.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
