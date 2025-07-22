import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HyperDrafter - AI-Powered Collaborative Editor',
  description: 'Write faster with intelligent AI feedback and suggestions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark min-h-screen antialiased`}>
        <div className="fixed inset-0 bg-gradient-to-br from-primary-950/20 via-transparent to-primary-950/20 pointer-events-none" />
        {children}
      </body>
    </html>
  )
}