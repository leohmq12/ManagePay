"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Send, Eye, Copy, Mail, Share2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmailInvoiceDialog } from "@/components/email-invoice-dialog"
import { ShareInvoiceDialog } from "@/components/share-invoice-dialog"
import { useAppStore } from "@/lib/store"
import { CURRENCIES, formatCurrency } from "@/lib/currencies"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export function InvoiceGenerator() {
  const { toast } = useToast()
  const { companies, settings } = useAppStore()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`)
  const [dueDate, setDueDate] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState(settings.defaultCurrency)
  const [taxRate, setTaxRate] = useState(settings.defaultTaxRate * 100) // Convert to percentage
  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }])
  const [notes, setNotes] = useState("")
  const [showSharingOptions, setShowSharingOptions] = useState(false)

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  const generateInvoice = () => {
    if (!selectedCompany || !clientName || !clientEmail || items.some((item) => !item.description)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Here you would typically send this to your backend
    const invoiceData = {
      company: selectedCompany,
      client: { name: clientName, email: clientEmail, address: clientAddress },
      invoiceNumber,
      dueDate,
      currency: selectedCurrency,
      items,
      subtotal,
      tax,
      taxRate: taxRate / 100,
      total,
      notes,
    }

    console.log("Generated Invoice:", invoiceData)

    toast({
      title: "Invoice Generated!",
      description: `Invoice ${invoiceNumber} has been created successfully`,
    })

    setShowSharingOptions(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Step 1</Badge>
            Select Your Company
          </CardTitle>
          <CardDescription>Choose which company this invoice is from</CardDescription>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No companies available. Please add a company first.</p>
              <Button variant="outline" onClick={() => (window.location.href = "/companies")}>
                Add Company
              </Button>
            </div>
          ) : (
            <>
              <Select onValueChange={(value) => setSelectedCompany(companies.find((c) => c.id === value) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies
                    .filter((c) => c.isActive)
                    .map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{company.name}</span>
                          <span className="text-sm text-muted-foreground">{company.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {selectedCompany && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">{selectedCompany.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedCompany.address}</p>
                  <p className="text-sm text-muted-foreground">{selectedCompany.email}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Step 2</Badge>
            Client Information
          </CardTitle>
          <CardDescription>Enter your client's details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Client Email *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="clientAddress">Client Address</Label>
            <Textarea
              id="clientAddress"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Enter client address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Step 3</Badge>
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                placeholder="10"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Step 4</Badge>
            Invoice Items
          </CardTitle>
          <CardDescription>Add items or services to your invoice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-5">
                  <Label>Description *</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label>Rate ({CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol})</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Label>Amount</Label>
                  <Input value={formatCurrency(item.amount, selectedCurrency)} readOnly className="bg-muted" />
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addItem} className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal, selectedCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRate}%):</span>
              <span>{formatCurrency(tax, selectedCurrency)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(total, selectedCurrency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Step 5</Badge>
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, thank you message, or other notes..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          {!showSharingOptions ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={generateInvoice} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-2" />
                <h3 className="font-medium">Invoice Generated Successfully!</h3>
                <p className="text-sm text-muted-foreground">Invoice {invoiceNumber} is ready to send</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <EmailInvoiceDialog
                  invoiceId={invoiceNumber}
                  invoiceNumber={invoiceNumber}
                  clientEmail={clientEmail}
                  amount={total}
                  trigger={
                    <Button className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Invoice
                    </Button>
                  }
                />

                <ShareInvoiceDialog
                  invoiceId={invoiceNumber}
                  invoiceNumber={invoiceNumber}
                  amount={total}
                  trigger={
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Link
                    </Button>
                  }
                />

                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowSharingOptions(false)}
                >
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
