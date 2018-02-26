import * as redis from 'redis'
import * as bluebird from 'bluebird'

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Store {
  private client : any

  constructor () {
    this.client = redis.createClient(process.env.REDIS_URL)
  }

  set (key : string, value : any) {
    return this.client.setAsync(key, JSON.stringify(value))
  }

  async get (key : string) {
    const result = await this.client.getAsync(key)
    return JSON.parse(result)
  }

  close () {
    this.client.quit()

    return new Promise(resolve => {
      this.client.on('end', () => {
        resolve()
      })
    })
  }

  public getClient () {
    return this.client
  }
}

export default Store
