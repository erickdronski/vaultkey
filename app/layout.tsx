import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VaultKey — Password Manager for AI Agents',
  description: 'The secure credentials vault built for autonomous AI agents. One vault, every agent, zero leaks.',
  openGraph: {
    title: 'VaultKey',
    description: 'The password manager built for AI agents',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
