export interface Currency {
  code: string
  name: string
  symbol: string
  decimals: number
}

export const CURRENCIES: Currency[] = [
  // Major Currencies
  { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", decimals: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimals: 2 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimals: 2 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", decimals: 2 },

  // Asian Currencies
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimals: 2 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", decimals: 0 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimals: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimals: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 2 },
  { code: "THB", name: "Thai Baht", symbol: "฿", decimals: 2 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", decimals: 2 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", decimals: 0 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", decimals: 2 },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", decimals: 0 },

  // European Currencies
  { code: "SEK", name: "Swedish Krona", symbol: "kr", decimals: 2 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", decimals: 2 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", decimals: 2 },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", decimals: 2 },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", decimals: 2 },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", decimals: 0 },
  { code: "RON", name: "Romanian Leu", symbol: "lei", decimals: 2 },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", decimals: 2 },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn", decimals: 2 },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", decimals: 2 },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", decimals: 2 },

  // Middle Eastern & African Currencies
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", decimals: 2 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", decimals: 2 },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼", decimals: 2 },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", decimals: 3 },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب", decimals: 3 },
  { code: "OMR", name: "Omani Rial", symbol: "﷼", decimals: 3 },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا", decimals: 3 },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل", decimals: 2 },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", decimals: 2 },
  { code: "ZAR", name: "South African Rand", symbol: "R", decimals: 2 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", decimals: 2 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", decimals: 2 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", decimals: 2 },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", decimals: 2 },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", decimals: 3 },

  // Latin American Currencies
  { code: "MXN", name: "Mexican Peso", symbol: "$", decimals: 2 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", decimals: 2 },
  { code: "ARS", name: "Argentine Peso", symbol: "$", decimals: 2 },
  { code: "CLP", name: "Chilean Peso", symbol: "$", decimals: 0 },
  { code: "COP", name: "Colombian Peso", symbol: "$", decimals: 2 },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", decimals: 2 },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U", decimals: 2 },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs", decimals: 2 },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "₲", decimals: 0 },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q", decimals: 2 },
  { code: "CRC", name: "Costa Rican Colon", symbol: "₡", decimals: 2 },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$", decimals: 2 },

  // Other Notable Currencies
  { code: "TRY", name: "Turkish Lira", symbol: "₺", decimals: 2 },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", decimals: 2 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", decimals: 2 },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", decimals: 2 },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "₨", decimals: 2 },
  { code: "NPR", name: "Nepalese Rupee", symbol: "₨", decimals: 2 },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K", decimals: 2 },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛", decimals: 2 },
  { code: "LAK", name: "Lao Kip", symbol: "₭", decimals: 2 },
  { code: "BND", name: "Brunei Dollar", symbol: "B$", decimals: 2 },
  { code: "FJD", name: "Fijian Dollar", symbol: "FJ$", decimals: 2 },
  { code: "TOP", name: "Tongan Pa'anga", symbol: "T$", decimals: 2 },
  { code: "WST", name: "Samoan Tala", symbol: "WS$", decimals: 2 },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "VT", decimals: 0 },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "SI$", decimals: 2 },
  { code: "PGK", name: "Papua New Guinea Kina", symbol: "K", decimals: 2 },
]

export function formatCurrency(amount: number, currencyCode = "USD"): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0]

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount)
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode)
  return currency?.symbol || "$"
}
