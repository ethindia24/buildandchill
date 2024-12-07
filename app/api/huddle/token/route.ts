import { AccessToken, Role } from '@huddle01/server-sdk/auth'
import { NextResponse } from 'next/server'

interface AccessTokenParams {
  apiKey: string
  roomId: string
  role: Role
  permissions: {
    admin: boolean
    canConsume: boolean
    canProduce: boolean
    canProduceSources: {
      cam: boolean
      mic: boolean
      screen: boolean
    }
    canRecvData: boolean
    canSendData: boolean
    canUpdateMetadata: boolean
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')

  if (!roomId) {
    return NextResponse.json({ error: 'roomId is required' }, { status: 400 })
  }

  const accessToken = new AccessToken({
    apiKey: process.env.HUDDLE01_API_KEY!,
    roomId: roomId,
    role: Role.HOST,
    permissions: {
      admin: true,
      canConsume: true,
      canProduce: true,
      canProduceSources: {
        cam: true,
        mic: true,
        screen: true
      },
      canRecvData: true,
      canSendData: true,
      canUpdateMetadata: true
    }
  } as AccessTokenParams)

  const token = await accessToken.toJwt()

  return NextResponse.json({ token })
} 