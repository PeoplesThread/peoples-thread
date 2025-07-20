import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'
import AdSenseScript from '@/components/AdSenseScript'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Peoples Thread - Amplifying Working Class Voices',
  description: 'A media project amplifying working class voices and socialist ideals. Independent news covering labor rights, social justice, and working class politics.',
  keywords: 'working class, socialist, labor rights, social justice, working class politics, peoples thread, socialist media',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <AdSenseScript />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}