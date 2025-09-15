"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Send, Eye, Copy, Mail, Share2, CheckCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmailInvoiceDialog } from "@/components/email-invoice-dialog"
import { ShareInvoiceDialog } from "@/components/share-invoice-dialog"
import { useAppStore } from "@/lib/store"
import { CURRENCIES, formatCurrency } from "@/lib/currencies"
import { InvoicePreview } from "@/components/invoice-preview"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

// Helper: generate invoice number
const generateInvoiceNumber = () => `INV-${Date.now()}`

export function InvoiceGenerator() {
  const { toast } = useToast()
  const { companies, settings } = useAppStore()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("") // fixed hydration mismatch
  const [dueDate, setDueDate] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState(settings.defaultCurrency)
  const [taxRate, setTaxRate] = useState<number | null>(settings.defaultTaxRate * 100) // %
  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }])
  const [notes, setNotes] = useState("")
  const [showSharingOptions, setShowSharingOptions] = useState(false)

  // New states
  const [previewInvoice, setPreviewInvoice] = useState(false)

  // Generate invoice number only after client mounts
  useEffect(() => {
    if (!invoiceNumber) {
      setInvoiceNumber(generateInvoiceNumber())
    }
  }, [invoiceNumber])

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
  const taxRateNumeric = taxRate ?? 0
  const tax = subtotal * (taxRateNumeric / 100)
  const total = subtotal + tax

  const invoiceData = {
    company: selectedCompany,
    client: { name: clientName, email: clientEmail, address: clientAddress },
    invoiceNumber,
    dueDate,
    currency: selectedCurrency,
    items,
    subtotal,
    tax,
    taxRate: taxRateNumeric / 100,
    total,
    notes,
  }

  const generateInvoice = () => {
    if (!selectedCompany || !clientName || !clientEmail || items.some((item) => !item.description)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    console.log("Generated Invoice:", invoiceData)

    toast({
      title: "Invoice Generated!",
      description: `Invoice ${invoiceNumber} has been created successfully`,
    })

    setShowSharingOptions(true)
  }

  const resetInvoice = () => {
    setSelectedCompany(null)
    setClientName("")
    setClientEmail("")
    setClientAddress("")
    setInvoiceNumber(generateInvoiceNumber())
    setDueDate("")
    setSelectedCurrency(settings.defaultCurrency)
    setTaxRate(settings.defaultTaxRate * 100)
    setItems([{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }])
    setNotes("")
    setShowSharingOptions(false)
    setPreviewInvoice(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Company</CardTitle>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Dropdown */}
              <div>
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
              </div>

              {/* Right side - Selected Company Info */}
              <div>
                {selectedCompany ? (
                  <div className="p-4 bg-muted rounded-lg h-full">
                    <h4 className="font-medium mb-2">{selectedCompany.name}</h4>
                    <p className="text-sm text-muted-foreground mb-1">{selectedCompany.address}</p>
                    <p className="text-sm text-muted-foreground">{selectedCompany.email}</p>
                    {selectedCompany.phone && (
                      <p className="text-sm text-muted-foreground">{selectedCompany.phone}</p>
                    )}
                    {selectedCompany.website && (
                      <p className="text-sm text-muted-foreground">{selectedCompany.website}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                      Select a company to see details
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
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
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Invoice Number</Label>
              <p className="p-2 rounded-md border bg-muted text-sm font-mono">
                {invoiceNumber || "Generating..."}
              </p>
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pr-10"
                />
              </div>
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
                value={taxRate === null ? "" : taxRate}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "") {
                    setTaxRate(null)
                    return
                  }
                  const parsed = parseFloat(val)
                  setTaxRate(isNaN(parsed) ? null : parsed)
                }}
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
          <CardTitle>Invoice Items</CardTitle>
          <CardDescription>Add items or services to your invoice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
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
                    value={item.quantity === 0 ? "" : item.quantity}
                    onChange={(e) => {
                      const val = e.target.value
                      updateItem(item.id, "quantity", val === "" ? 0 : parseInt(val))
                    }}
                    min="1"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label>Rate ({CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol})</Label>
                  <Input
                    type="number"
                    value={item.rate === 0 ? "" : item.rate}
                    onChange={(e) => {
                      const val = e.target.value
                      updateItem(item.id, "rate", val === "" ? 0 : parseFloat(val))
                    }}
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
              <span>Tax ({taxRateNumeric}%):</span>
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
          <CardTitle>Additional Notes</CardTitle>
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
              <Button variant="outline" onClick={() => setPreviewInvoice(true)} className="flex-1 bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview
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
                  invoiceData={invoiceData}
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

                <Button variant="outline" className="flex-1 bg-transparent" onClick={resetInvoice}>
                  Create Another
                </Button>
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {previewInvoice && (
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold">Invoice Preview</h3>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => {
                      // Function to download invoice as PDF
                      const invoiceElement = document.getElementById("invoice-preview")
                      if (invoiceElement) {
                        toast({
                          title: "Download Started",
                          description: "Invoice download will be implemented with PDF generation",
                        })
                      }
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewInvoice(false)}
                    className="w-full sm:w-auto"
                  >
                    Close Preview
                  </Button>
                </div>
              </div>

              {/* Responsive container for the invoice */}
              <div className="overflow-x-auto">
                <div className="min-w-full max-w-4xl mx-auto">
                  <InvoicePreview invoiceData={invoiceData} />
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
          <Button onClick={generateInvoice} className="flex-1 sm:flex-none">
            <Send className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>
    )}
  </CardContent>
</Card>
    </div>
  )
}
