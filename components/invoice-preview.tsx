// components/invoice-preview.tsx
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, CURRENCIES } from "@/lib/currencies"
import { format } from "date-fns"

interface InvoicePreviewProps {
  invoiceData: {
    company: any
    client: {
      name: string
      email: string
      address: string
    }
    invoiceNumber: string
    dueDate: string
    currency: string
    items: Array<{
      id: string
      description: string
      quantity: number
      rate: number
      amount: number
    }>
    subtotal: number
    tax: number
    taxRate: number
    total: number
    notes: string
  }
}

export function InvoicePreview({ invoiceData }: InvoicePreviewProps) {
  const { company, client, invoiceNumber, dueDate, currency, items, subtotal, tax, total, notes } = invoiceData
  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  return (
    <Card className="w-full bg-white" id="invoice-preview">
      <CardContent className="p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold">INVOICE</h1>
            <p className="text-muted-foreground text-sm">#{invoiceNumber}</p>
          </div>
          {company && (
            <div className="text-left sm:text-right">
              <h2 className="text-lg font-semibold">{company.name}</h2>
              <p className="text-sm">{company.address}</p>
              <p className="text-sm">{company.email}</p>
              {company.phone && <p className="text-sm">{company.phone}</p>}
            </div>
          )}
        </div>

        {/* Client and Date Info */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p>{client.name || "Client Name"}</p>
            {client.email && <p>{client.email}</p>}
            {client.address && <p className="whitespace-pre-line">{client.address}</p>}
          </div>
          <div className="text-left sm:text-right">
            <div className="mb-2">
              <span className="font-semibold">Invoice Date: </span>
              <span>{format(new Date(), "MMM dd, yyyy")}</span>
            </div>
            {dueDate && (
              <div>
                <span className="font-semibold">Due Date: </span>
                <span>{format(new Date(dueDate), "MMM dd, yyyy")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-2 sm:px-4">Description</th>
                <th className="text-right py-2 px-2 sm:px-4">Quantity</th>
                <th className="text-right py-2 px-2 sm:px-4">Rate</th>
                <th className="text-right py-2 px-2 sm:px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-2 sm:px-4">{item.description || "-"}</td>
                  <td className="py-3 px-2 sm:px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-2 sm:px-4 text-right">{formatCurrency(item.rate, currency)}</td>
                  <td className="py-3 px-2 sm:px-4 text-right">{formatCurrency(item.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto w-full sm:w-64 mb-6 sm:mb-8">
          <div className="flex justify-between py-2">
            <span className="font-semibold">Subtotal:</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between py-2">
              <span className="font-semibold">Tax ({invoiceData.taxRate * 100}%):</span>
              <span>{formatCurrency(tax, currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Notes:</h3>
            <p className="text-sm whitespace-pre-line">{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200 text-center text-xs text-muted-foreground">
          <p>Thank you for your business!</p>
          {company && company.terms && (
            <p className="mt-2">{company.terms}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}