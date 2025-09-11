"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Company {
  id: string
  name: string
  email: string
  address: string
  phone?: string
  website?: string
  taxId?: string
  stripeAccountId?: string
  isActive: boolean
  createdAt: string
  stats: {
    totalRevenue: number
    invoiceCount: number
    clientCount: number
  }
}

interface AppSettings {
  defaultCurrency: string
  defaultTaxRate: number
  processingFeeRate: number
  processingFeeFixed: number
}

interface AppState {
  companies: Company[]
  settings: AppSettings
  addCompany: (company: Omit<Company, "id" | "createdAt" | "stats">) => void
  updateCompany: (id: string, updates: Partial<Company>) => void
  deleteCompany: (id: string) => void
  toggleCompanyStatus: (id: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      companies: [],
      settings: {
        defaultCurrency: "USD",
        defaultTaxRate: 0.1, // 10%
        processingFeeRate: 0.029, // 2.9%
        processingFeeFixed: 0.3, // $0.30
      },
      addCompany: (companyData) => {
        const company: Company = {
          ...companyData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split("T")[0],
          stats: {
            totalRevenue: 0,
            invoiceCount: 0,
            clientCount: 0,
          },
        }
        set((state) => ({
          companies: [...state.companies, company],
        }))
      },
      updateCompany: (id, updates) => {
        set((state) => ({
          companies: state.companies.map((company) => (company.id === id ? { ...company, ...updates } : company)),
        }))
      },
      deleteCompany: (id) => {
        set((state) => ({
          companies: state.companies.filter((company) => company.id !== id),
        }))
      },
      toggleCompanyStatus: (id) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === id ? { ...company, isActive: !company.isActive } : company,
          ),
        }))
      },
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },
    }),
    {
      name: "payment-terminal-storage",
    },
  ),
)
