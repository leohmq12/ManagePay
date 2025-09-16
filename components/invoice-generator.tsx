"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Send, Eye, Copy, CheckCircle, Download, Mail, Share2 } from "lucide-react"
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
  const invoicePreviewRef = useRef<HTMLDivElement>(null)

  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("") // fixed hydration mismatch
  const [dueDate, setDueDate] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState(settings.defaultCurrency)
  const [taxRate, setTaxRate] = useState<number>(settings.defaultTaxRate * 100)
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0, amount: 0 },
  ])
  const [notes, setNotes] = useState("")
  const [showSharingOptions, setShowSharingOptions] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState(false)
  const [drafts, setDrafts] = useState<any[]>([])

  // Generate invoice number after mount
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
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "rate") {
            updated.amount = Number(updated.quantity) * Number(updated.rate)
          }
          return updated
        }
        return item
      })
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxRateNumeric = taxRate || 0
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
    taxRate: taxRateNumeric,
    total,
    notes,
  }

  const validateForm = () => {
    if (!selectedCompany) {
      toast({
        title: "Company Required",
        description: "Please select a company",
        variant: "destructive",
      })
      return false
    }
    
    if (!clientName.trim()) {
      toast({
        title: "Client Name Required",
        description: "Please enter client name",
        variant: "destructive",
      })
      return false
    }
    
    if (!clientEmail.trim()) {
      toast({
        title: "Client Email Required",
        description: "Please enter client email",
        variant: "destructive",
      })
      return false
    }
    
    if (items.some((i) => !i.description.trim())) {
      toast({
        title: "Item Description Required",
        description: "Please add description for all items",
        variant: "destructive",
      })
      return false
    }
    
    return true
  }

  const generateInvoice = () => {
    if (!validateForm()) return
    
    toast({
      title: "Invoice Generated!",
      description: `Invoice ${invoiceNumber} created successfully.`,
    })
    setShowSharingOptions(true)
  }

  const saveAsDraft = () => {
    setDrafts([...drafts, { ...invoiceData, invoiceNumber }])
    toast({
      title: "Saved as Draft",
      description: `Invoice ${invoiceNumber} saved.`,
    })
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

  const downloadPDF = () => {
    if (!validateForm()) return;
    
    // Create a print-friendly version
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #333;">INVOICE: ${invoiceNumber}</h1>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
        </div>
        
        <div style="display: flex; justify-content: space-between; margin: 20px 0; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 250px; margin-bottom: 15px;">
            <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">From:</h3>
            <p>${selectedCompany?.name || ''}<br/>
            ${selectedCompany?.email || ''}<br/>
            ${selectedCompany?.address || ''}</p>
          </div>
          <div style="flex: 1; min-width: 250px;">
            <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">To:</h3>
            <p>${clientName}<br/>
            ${clientEmail}<br/>
            ${clientAddress}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Description</th>
              <th style="text-align: right; padding: 12px; border: 1px solid #ddd;">Qty</th>
              <th style="text-align: right; padding: 12px; border: 1px solid #ddd;">Rate</th>
              <th style="text-align: right; padding: 12px; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.description}</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #ddd;">${formatCurrency(item.rate, selectedCurrency)}</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #ddd;">${formatCurrency(item.amount, selectedCurrency)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px;">
          <p style="margin: 5px 0;">Subtotal: ${formatCurrency(subtotal, selectedCurrency)}</p>
          <p style="margin: 5px 0;">Tax (${taxRateNumeric}%): ${formatCurrency(tax, selectedCurrency)}</p>
          <p style="margin: 10px 0; font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 5px;">
            Total: ${formatCurrency(total, selectedCurrency)}
          </p>
        </div>
        
        ${notes ? `
          <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #333;">
            <strong>Notes:</strong><br/>${notes}
          </div>
        ` : ''}
      </div>
    `;
    
    // Open print dialog with better error handling
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoiceNumber}</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  color: #333;
                  line-height: 1.4;
                }
                @media print {
                  body { 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact;
                  }
                  @page { 
                    margin: 1cm; 
                    size: A4;
                  }
                  table { 
                    page-break-inside: avoid; 
                  }
                  .avoid-break {
                    page-break-inside: avoid;
                  }
                }
                @media all {
                  .page-break { display: none; }
                }
                @media print {
                  .page-break { 
                    display: block; 
                    page-break-before: always; 
                  }
                }
              </style>
            </head>
            <body onload="setTimeout(function() { 
              window.print(); 
              setTimeout(function() { window.close(); }, 500); 
            }, 500);">
              ${printContent}
              <div class="page-break"></div>
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // Focus the window
        printWindow.focus();
        
        toast({ 
          title: "Print Dialog Opened", 
          description: "Use your browser's print function to save as PDF." 
        });
      } else {
        throw new Error("Popup blocked by browser");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Not Available",
        description: "Please allow popups for this site or try a different browser.",
        variant: "destructive",
      });
      
      // Fallback: Show print content in current window
      const userConfirmed = confirm("Popup was blocked. Click OK to view invoice in this window for printing.");
      if (userConfirmed) {
        document.body.innerHTML += `
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 10000; padding: 20px; overflow: auto;">
            <button onclick="this.parentElement.remove()" style="position: fixed; top: 20px; right: 20px; padding: 10px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Close
            </button>
            ${printContent}
          </div>
        `;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Company</CardTitle>
          <CardDescription>Choose which company this invoice belongs to</CardDescription>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-6">
              <p className="mb-3 text-muted-foreground">No companies found. Add one first.</p>
              <Button onClick={() => (window.location.href = "/companies")}>Add Company</Button>
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
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Client Name *</Label>
              <Input 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label>Client Email *</Label>
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
          </div>
          <div>
            <Label>Client Address</Label>
            <Textarea 
              value={clientAddress} 
              onChange={(e) => setClientAddress(e.target.value)} 
              placeholder="Enter full address"
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
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Invoice Number</Label>
              <div className="border rounded-md p-2 bg-muted font-mono text-sm">
                {invoiceNumber}
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="max-w-xs">
      <Label>Tax Rate (%)</Label>
      <Input
        type="number"
        value={taxRate}
        onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
        min="0"
        max="100"
        step="0.1"
      />
    </div>
      
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
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
                  onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                  min="1"
                />  
              </div>
              <div className="col-span-4 md:col-span-2">
                <Label>Rate</Label>
                <Input
                  type="number"
                  value={item.rate}
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.value = "";
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      updateItem(item.id, "rate", 0);
                    }
                  }}
                  onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />

              </div>
              <div className="col-span-3 md:col-span-2">
                <Label>Amount</Label>
                <Input 
                  value={formatCurrency(item.amount, selectedCurrency)} 
                  readOnly 
                  className="bg-muted"
                />
              </div>
              <div className="col-span-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 1}
                  className="h-10 w-10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={addItem} variant="outline" className="h-10">
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
          <Separator />
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal, selectedCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRateNumeric}%):</span>
              <span>{formatCurrency(tax, selectedCurrency)}</span>
            </div>
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
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, thank you note, etc."
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
                <Button variant="outline" onClick={() => setPreviewInvoice(true)} className="flex-1 bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview Invoice
              </Button>
              </div>
            </div>
          )}
          {previewInvoice && (
            <div className="mt-6">
              <div className="flex justify-between mb-3">
                <h3 className="font-bold">Invoice Preview</h3>
                <div className="flex gap-2">
                  <Button onClick={downloadPDF} className="h-10">
                    <Download className="w-4 h-4 mr-1" /> Download PDF
                  </Button>
                  <Button variant="outline" className="h-10" onClick={() => setPreviewInvoice(false)}>
                    Close
                  </Button>
                </div>
              </div>
              <div id="invoice-preview" ref={invoicePreviewRef}>
                <InvoicePreview invoiceData={invoiceData} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}