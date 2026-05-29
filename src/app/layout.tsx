import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gu Gia Dụng — Dashboard',
  description: 'Hệ thống AI agent tự động hóa TikTok content cho kênh Gu Gia Dụng',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
