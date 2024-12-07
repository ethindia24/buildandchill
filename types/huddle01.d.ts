declare module '@huddle01/server-sdk/auth' {
  export enum Role {
    HOST = 'HOST',
    CO_HOST = 'CO_HOST',
    GUEST = 'GUEST',
    LISTENER = 'LISTENER'
  }

  export class AccessToken {
    constructor(params: {
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
    })

    toJwt(): Promise<string>
  }
} 