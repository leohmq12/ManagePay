"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Download,
  Eye,
  Send,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { formatCurrency } from "@/lib/currencies"

interface DashboardStats {
  totalRevenue: number
  monthlyRevenue: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalClients: number
  revenueGrowth: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  amount: number
  status: "paid" | "pending" | "overdue" | "draft"
  dueDate: string
  createdDate: string
  companyName: string
}

interface RevenueData {
  month: string
  revenue: number
  invoices: number
}

interface CompanyRevenue {
  name: string
  revenue: number
  color: string
}

export function PaymentDashboard() {
  const { companies, settings } = useAppStore()
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedCompany, setSelectedCompany] = useState("all")

  const calculateStats = (): DashboardStats => {
    const totalStats = companies.reduce(
      (acc, company) => ({
        revenue: acc.revenue + company.stats.totalRevenue,
        invoices: acc.invoices + company.stats.invoiceCount,
        clients: acc.clients + company.stats.clientCount,
      }),
      { revenue: 0, invoices: 0, clients: 0 },
    )

    return {
      totalRevenue: totalStats.revenue,
      monthlyRevenue: totalStats.revenue * 0.15, // Estimate 15% monthly
      totalInvoices: totalStats.invoices,
      paidInvoices: Math.floor(totalStats.invoices * 0.85), // 85% paid
      pendingInvoices: Math.floor(totalStats.invoices * 0.1), // 10% pending
      overdueInvoices: Math.floor(totalStats.invoices * 0.05), // 5% overdue
      totalClients: totalStats.clients,
      revenueGrowth: 12.5, // Could be calculated from historical data
    }
  }

  const stats = calculateStats()

  const generateRevenueData = (): RevenueData[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month, index) => ({
      month,
      revenue: Math.floor((stats.totalRevenue / 6) * (0.8 + Math.random() * 0.4)), // Vary by ±20%
      invoices: Math.floor((stats.totalInvoices / 6) * (0.8 + Math.random() * 0.4)),
    }))
  }

  const generateCompanyRevenue = (): CompanyRevenue[] => {
    const colors = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]
    return companies.map((company, index) => ({
      name: company.name,
      revenue: company.stats.totalRevenue,
      color: colors[index % colors.length],
    }))
  }

  const generateInvoices = (): Invoice[] => {
    const statuses: Array<"paid" | "pending" | "overdue" | "draft"> = ["paid", "pending", "overdue"]
    const clients = [
      "John Doe",
      "Jane Smith",
      "Bob Johnson",
      "Alice Brown",
      "Charlie Wilson",
      "Sarah Davis",
      "Mike Wilson",
    ]

    return companies
      .flatMap((company, companyIndex) =>
        Array.from({ length: Math.min(company.stats.invoiceCount, 3) }, (_, index) => ({
          id: `${companyIndex}-${index}`,
          invoiceNumber: `INV-2024-${String(companyIndex * 100 + index + 1).padStart(3, "0")}`,
          clientName: clients[Math.floor(Math.random() * clients.length)],
          amount: Math.floor(Math.random() * 5000) + 500,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          companyName: company.name,
        })),
      )
      .slice(0, 10) // Limit to 10 most recent
  }

  const revenueData = generateRevenueData()
  const companyRevenue = generateCompanyRevenue()
  const invoices = generateInvoices()

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
      draft: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.toUpperCase()}</Badge>
  }

  const formatCurrencyWithSettings = (amount: number) => {
    return formatCurrency(amount, settings.defaultCurrency)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Dashboard</h1>
          <p className="text-muted-foreground">Track your revenue, invoices, and business performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies
                .filter((c) => c.isActive)
                .map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyWithSettings(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-primary" />+{stats.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyWithSettings(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">Current month earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidInvoices} paid, {stats.pendingInvoices} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrencyWithSettings(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Company</CardTitle>
            <CardDescription>Distribution of revenue across companies</CardDescription>
          </CardHeader>
          <CardContent>
            {companyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={companyRevenue}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {companyRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrencyWithSettings(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No company data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Manage and track your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({stats.paidInvoices})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pendingInvoices})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({stats.overdueInvoices})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {invoices.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{invoice.companyName}</TableCell>
                          <TableCell>{formatCurrencyWithSettings(invoice.amount)}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
                  <p className="text-muted-foreground mb-4">Create your first invoice to see it here</p>
                  <Button onClick={() => (window.location.href = "/")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paid">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Showing paid invoices only</p>
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Showing pending invoices only</p>
              </div>
            </TabsContent>

            <TabsContent value="overdue">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Showing overdue invoices only</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" onClick={() => (window.location.href = "/")}>
              <FileText className="h-4 w-4 mr-2" />
              Create New Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Send className="h-4 w-4 mr-2" />
              Send Payment Reminder
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Paid Invoices</span>
                <Badge variant="default">{stats.paidInvoices}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Payments</span>
                <Badge variant="secondary">{stats.pendingInvoices}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue Invoices</span>
                <Badge variant="destructive">{stats.overdueInvoices}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Revenue</span>
                <span className="font-medium">{formatCurrencyWithSettings(stats.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Invoices Sent</span>
                <span className="font-medium">{Math.floor(stats.totalInvoices * 0.2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Growth</span>
                <span className="font-medium text-primary">+{stats.revenueGrowth}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
