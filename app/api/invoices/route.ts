import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const invoices = new Map()

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json()

    const invoice = {
      id: `inv_${Date.now()}`,
      ...invoiceData,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    invoices.set(invoice.id, invoice)

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const companyId = url.searchParams.get("companyId")

    let allInvoices = Array.from(invoices.values())

    if (companyId) {
      allInvoices = allInvoices.filter((invoice) => invoice.companyId === companyId)
    }

    return NextResponse.json(allInvoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}
