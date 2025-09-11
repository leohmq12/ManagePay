import { InvoicePayment } from "@/components/invoice-payment"

interface PageProps {
  params: {
    invoiceId: string
  }
}

export default function PayInvoicePage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-background">
      <InvoicePayment invoiceId={params.invoiceId} />
    </div>
  )
}
