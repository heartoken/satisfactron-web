import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/Header"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Heartoken - Système de satisfaction",
  description: "Système de vote de satisfaction avec suivi par appareil",
  generator: 'v0.dev',
  icons: {
    icon: '/heartoken.png',
    shortcut: '/heartoken.png',
    apple: '/heartoken.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-background">{children}</main>
      </body>
    </html>
  )
}
