import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "ContractIQ - Construction Contract Intelligence",
  description: "AI-powered platform for construction contract management and change order tracking",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <main className="pl-56">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
