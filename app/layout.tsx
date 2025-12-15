import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PAXAFE Integration API',
  description: 'Tive webhook integration API for PAXAFE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

