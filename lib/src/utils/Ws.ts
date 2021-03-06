import * as ConfigLoader from '../config/ConfigLoader'
import type { Decoder } from '../decoders/Decoder'
import type { Subscription } from '../models'
import { APP_NAME } from './Constants'
import { getOrThrow } from './Utils'

const createWebsocket = async (url: string) => {
  const { applicationName } = await ConfigLoader.loadAppConfig()
  const urlWithParams = new URL(url)
  urlWithParams.searchParams.set(APP_NAME, applicationName)
  return new WebSocket(urlWithParams.href)
}

export class Ws<Req> {
  private socket: Promise<WebSocket>

  constructor(url: string) {
    this.socket = new Promise(async (resolve, reject) => {
      const wss = await createWebsocket(url)
      wss.onopen = () => resolve(wss)
      wss.onerror = (event: Event) => reject({ message: 'error', ...event })
    })
  }

  private send(msg: Req): Promise<void> {
    return this.socket.then((wss) => wss.send(JSON.stringify(msg)))
  }

  private subscribeOnly<T>(cb: (msg: T) => void, decoder?: Decoder<T>): Subscription {
    this.socket.then(
      (wss) =>
        (wss.onmessage = (event) => {
          const response: T = decoder
            ? getOrThrow(decoder.decode(JSON.parse(event.data)))
            : JSON.parse(event.data)
          return cb(response)
        })
    )

    return this.subscription
  }

  subscribe<T>(msg: Req, cb: (msg: T) => void, decoder?: Decoder<T>): Subscription {
    this.send(msg).then(() => this.subscribeOnly(cb, decoder))
    return this.subscription
  }

  singleResponse<T>(msg: Req, decoder?: Decoder<T>): Promise<T> {
    return new Promise<T>((resolve) => {
      this.subscribe(msg, (response: T) => resolve(response), decoder)
    })
  }

  private readonly subscription: Subscription = {
    cancel: () => this.socket.then((wss) => wss.close())
  }
}
