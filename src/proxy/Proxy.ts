/* eslint-disable no-unused-expressions */
import axios, {
  AxiosProxyConfig,
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';

export default class Proxy {
  host: string;

  port: number;

  protocol: string;

  lastUsed: number;

  requestsSent: number;

  maxRequests: number;

  cooldownTime: number;

  auth?: AxiosProxyConfig['auth'];

  static TestURL = '';

  Proxyconfig: AxiosRequestConfig;

  reseverd = false;

  constructor(
    host: string,
    port: number,
    protocol: string,
    auth: AxiosProxyConfig['auth'],
  ) {
    // console.log('Proxy Auth ', auth);
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.lastUsed = 0;
    this.requestsSent = 0;
    this.maxRequests = 10000;
    this.cooldownTime = 60 * 15 * 1000; // 5 minutes in milliseconds
    // eslint-disable-next-line no-sequences
    this.auth = auth;
    Proxy.TestURL = 'https://www.imobiliare.ro/robots.txt';
    if (
      protocol.toLocaleLowerCase() === 'socks5' ||
      protocol.toLocaleLowerCase() === 'socks4'
    ) {
      const proxy = `${protocol}://${host}:${port}`;
      const httpAgent = new SocksProxyAgent(proxy);
      const httpsAgent = new SocksProxyAgent(proxy);
      this.Proxyconfig = {
        httpAgent,
        httpsAgent,
      };
    } else {
      this.Proxyconfig = {
        proxy: {
          protocol: this.protocol,
          host: this.host,
          port: this.port,
          auth: this.auth,
        },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        },
      };
    }
  }

  fetch(url: string, headersS: RawAxiosRequestHeaders): Promise<AxiosResponse> {
    this.markUsed();

    return axios.get(url, {
      ...this.Proxyconfig,
      headers: {
        ...headersS,
      },
    });
  }

  getProxyString(): { less: string; full: string } {
    return {
      less: `${this.host}:${this.port}`,
      full: `${this.protocol}://${this.auth?.username}:${this.auth?.password}@${this.host}:${this.port}`,
    };
  }

  async isLive() {
    try {
      const response = await axios.get(Proxy.TestURL, {
        ...this.Proxyconfig,
        timeout: 12000,
      });
      // console.log('check IS live ***');

      if (response.status === 200) {
        // console.log('Response OK - ^_^ - Proxy transformed');
        return true;
      }
      return false;
    } catch (error) {
      // console.error('Bad Response :/ ', error);
      return false;
    }
  }

  setWait() {
    this.requestsSent = 999;
  }

  canUse() {
    if (this.requestsSent >= this.maxRequests) {
      const timeSinceLastUse = Date.now() - this.lastUsed;
      const is = timeSinceLastUse > this.cooldownTime;
      if (is) this.requestsSent = 0;

      return is;
    }

    return true;
  }

  // mark as USed
  markUsed() {
    // console.log("IP : ", this.host, "USed : ", this.requestsSent);

    this.lastUsed = Date.now();
    this.requestsSent += 1;
  }

  // {id  : string , val : boolean }

  reset() {
    this.lastUsed = 0;
    this.requestsSent = 0;
  }
}
