import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chat Unificado - GPT, Claude & Gemini',
  description: 'ChatGPT Plus, Claude e Gemini em um só lugar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
