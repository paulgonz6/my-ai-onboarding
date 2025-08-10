import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/app/contexts/AuthContext'
import DebugPanel from '@/app/components/DebugPanel'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'My AI Onboarding - Your 90-Day Journey to AI Mastery',
  description: 'Stop learning AI. Start collaborating with it. Transform AI from mysterious technology to trusted colleague in 90 days.',
  keywords: 'AI onboarding, AI collaboration, AI training, ChatGPT, Claude, Gemini, productivity',
  openGraph: {
    title: 'My AI Onboarding - Your 90-Day Journey to AI Mastery',
    description: 'Transform AI from mysterious technology to trusted colleague in 90 days.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <DebugPanel />
        </AuthProvider>
      </body>
    </html>
  )
}