import { Auth, Api } from '@kkbox/kkbox-js-sdk'
import Store from './store'

interface IAuthData {
  access_token: string;
  expires_in: number;
}

class API {
  private auth : Auth
  private accessToken? : string
  private store : Store
  private apiClient : Api

  constructor() {
    this.auth = new Auth(process.env.KKBOX_APP_ID, process.env.KKBOX_APP_SECRET)
    this.store = new Store()
    this.accessToken = undefined
  }

  async initialize() {
    await this.getAccessToken()
    this.apiClient = new Api(this.accessToken)
  }

  async getAccessToken() {
    const TOKEN_KEY = 'kkbox_access_token'
    const EXP_KEY = 'kkbox_token_expires_in'

    if (!this.accessToken) {
      let token

      try {
        const expires_in = await this.store.get(EXP_KEY)
        token = await this.store.get(TOKEN_KEY)

        if (new Date() > new Date(expires_in)) {
          // token expiration
          token = undefined
        }
      } catch (e) {}

      if (typeof token === 'undefined' || token === null) {
        const authData = await this.generateAccessToken()
        token = authData.access_token

        await this.store.set(TOKEN_KEY, authData.access_token)
        await this.store.set(EXP_KEY, authData.expires_in)
      }

      this.accessToken = token
    }
  }

  async generateAccessToken() : Promise<IAuthData> {
    const { data: { access_token, expires_in } } = await this.auth.clientCredentialsFlow.fetchAccessToken()
    return { access_token, expires_in }
  }

  get client () {
    return this.apiClient
  }

  async dispose () {
    await this.store.close()
    this.store = null

    this.accessToken = undefined
    this.apiClient = null
  }
}

export default new API()
