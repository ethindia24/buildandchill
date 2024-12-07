"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletIcon, User } from 'lucide-react'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("spaces")

  return (
    <header className="flex items-center justify-between border-b p-4">
      <h1 className="text-2xl font-bold">buildandchill</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="spaces">Spaces</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <WalletIcon className="mr-2 h-4 w-4" />
              {walletConnected ? "0xAb...123" : "Connect Wallet"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {walletConnected ? (
              <>
                <DropdownMenuItem onClick={() => setWalletConnected(false)}>
                  Disconnect
                </DropdownMenuItem>
                <DropdownMenuItem>Switch Wallet</DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => setWalletConnected(true)}>
                Connect Wallet
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

