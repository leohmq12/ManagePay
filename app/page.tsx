import { Sidebar } from "@/components/sidebar"
import { InvoiceGenerator } from "@/components/invoice-generator"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Payment Terminal</h1>
            <p className="text-muted-foreground">Manage invoices, payments, and track your business revenue</p>
          </div>
          <InvoiceGenerator />
        </div>
      </main>
    </div>
  )
}
