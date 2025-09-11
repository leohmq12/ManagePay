import { loadStripe } from "@stripe/stripe-js"

// Make sure to add your Stripe publishable key to your environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export { stripePromise }

export interface PaymentIntentData {
  amount: number
  currency: string
  description: string
  customerEmail?: string
  metadata?: Record<string, string>
}

export interface InvoiceData {
  id: string
  invoiceNumber: string
  companyId: string
  clientEmail: string
  amount: number
  description: string
  dueDate: string
  status: "draft" | "sent" | "paid" | "overdue"
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  subtotal: number
  tax: number
  total: number
  createdAt: string
  updatedAt: string
}
