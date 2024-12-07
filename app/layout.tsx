import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import { Providers } from "./providers"
import '@coinbase/onchainkit/styles.css';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "buildandchill",
  description: "A 2D interactive builder space",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
          <Providers>
            <div className="flex h-screen flex-col">
              <Header />
              <main className="flex-1 overflow-hidden">{children}</main>
            </div>
          </Providers>
        
      </body>
    </html>
  )
}

