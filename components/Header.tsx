"use client"
import { WalletDefault } from '@coinbase/onchainkit/wallet';

export default function Header() {

  return (
    <header className="flex items-center justify-between border-b p-4">
      <h1 className="text-2xl font-bold">buildandchill</h1>
      
      <div className="flex items-center space-x-4">
      <WalletDefault />
      </div>
    </header>
  )
}

