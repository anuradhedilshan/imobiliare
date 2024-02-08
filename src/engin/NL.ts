/* eslint-disable camelcase */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios, {
  AxiosError,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from 'axios';
import axiosRetry from 'axios-retry';
import { IpcMainEvent } from 'electron';
import he from 'he';

import Logger from './Logger';
import JSONWriter from './JSONWriter';
import ProxyList from '../proxy';
import Proxy from '../proxy/Proxy';

enum Tranzactie {
  Devânzare = 1,
  Deînchiriat = 2,
}

enum Proprietate {
  apartment = 1,
  commercial = 2,
  house = 3,
  terrain = 4,
}

export type LocationType = {
  nume: string;
  id: string | number;
  id_judet: number | string;
  nume_judet: string;
  id_localitate: number;
  nume_localitate: string;
  tip: number;
  id_zona: string | number;
};
type filterDataType = {
  localitate: LocationType;
  zone: string | null;
  proprietate: Proprietate;
  tranzactie: Tranzactie;
};

type CB = (
  Type: 'progress' | 'count' | 'complete' | 'error' | 'details' | 'warn',
  message: number | boolean | string | null,
) => void;

let logger: Logger | null = null;
function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const headers: RawAxiosRequestHeaders = {
  uuid: 'efbc128b-0ad7-44b5-86fc-fe409aebffc7',
  soapp: 'android',
  rmkey: '231jkda5fab#sGSf!xPt@',
  'accept-encoding': 'gzip',
  'user-agent': 'okhttp/4.9.0',
};

// Configure axios to use axios-retry
axiosRetry(axios, {
  retries: 3,
  retryCondition(error: AxiosError): boolean {
    if (error.response?.status === 400) {
      console.warn('Invalid Filter Options');
      return false;
    }
    return true;
  },
  retryDelay(retryCount, error) {
    return retryCount * 5000;
  },
});

// getAdList
async function getAnunturis(
  t: Tranzactie,
  c: Proprietate,
  l: string | number,
  offset: number,
  limit: number,
  proxy: Proxy | null,
): Promise<any> {
  const url = `https://apirm.imobiliare.ro/2.2/anunturi?tranzactie=${t}&categorie=${c}${
    /* &tip_proprietate=2,3,1,4 */ ''
  }&localitati=${l}&sortare=sctl&offset=${offset}&limit=${limit}`;
  try {
    const { status, data } = await (proxy
      ? proxy.fetch(url, headers)
      : axios.get(url, { headers }));
    if (status !== 200 || data.status !== 'success')
      throw new Error('request failed');
    return data.data;
  } catch (e) {
    // console.log(e);

    console.error(`Reqest tried 3 times due to : <b>${e}</b> @getAnunturis`);
    return null;
  }
}

// getAd
async function getAnunturi(id: string): Promise<AxiosResponse> {
  const url = `https://apirm.imobiliare.ro/2.2/anunturi/${id}`;

  return axios.get(url, { headers });
}

function getAnunturiUrl(id: string): string {
  const url = `https://apirm.imobiliare.ro/2.2/anunturi/${id}`;
  return url;
}

const Thread = 20;

function setLoggerCallback(cb: CB): Logger {
  logger = new Logger(cb);
  return logger;
}
// startAll

async function startAll(
  {
    filters,
    filepath,
  }: {
    filters: filterDataType;
    filepath: string;
  },
  onEvent: CB,
  proxylist: ProxyList,
) {
  console.warn(`Prosess Started...${JSON.stringify(filters)}`);
  let count = 0;
  // getAdsCount
  const p = await proxylist.getProxy();
  const ads = await getAnunturis(
    filters.tranzactie,
    filters.proprietate,
    filters.localitate.id_localitate,
    0,
    0,
    p,
  );
  if (!ads) {
    console.error('getAdsCount Failed In Engine.ts');
    onEvent('complete', 'Failed');
    return;
  }

  const { total, titlu, categorie, tranzactie, id_lista } = ads as any;
  // const Writer = new JSONWriter(`${filepath}/${id_lista}`);
  console.log(`${filepath}/${id_lista}.json`);

  // send StatusUpdateEvent
  console.log(`Got ${total} Ads in ${titlu}`);
  let failedReq: string[] = [];
  // Runner
  for (let loop = 0; loop <= total + Thread; loop += Thread) {
    console.warn(`Total : ${total} -  loop :  ${loop}`);
    const promises = [];
    let failed = 0;
    const Data: any[] = [];
    const proxy = await proxylist.getProxy();
    const a = await getAnunturis(
      filters.tranzactie,
      filters.proprietate,
      filters.localitate.id_localitate,
      loop,
      Thread,
      proxy,
    );
    console.warn(
      `${failedReq.length} Requests Failed : ${a.anunturi.length}  have to send`,
    );
    if (failedReq.length > 0) a.anunturi = a.anunturi.concat(failedReq);
    console.warn(`After concat  : ${a.anunturi.length}  have to send`);
    failedReq = [];
    for (const i of a.anunturi) {
      await sleep(100);
      promises.push(
        proxy
          .fetch(getAnunturiUrl(i.id), headers)
          .then(({ data, status }: AxiosResponse) => {
            console.log(`${count} : got ${i.id} - ${status}`);
            if (status !== 200 || data.status !== 'success')
              throw new Error(`${i.id} requests failed`);
            delete data.data.poze;
            Data.push(data.data);
            count += 1;
            return i.id;
          })
          .catch((e: AxiosError) => {
            console.error(`Reqest Failed ${i.id} : ${e.message}`);
            if (e.response?.status !== 400) {
              failed += 1;
              failedReq.push(i);
              proxy.setWait();
            }
          }),
      );
    }
    await Promise.all(promises);
    onEvent('progress', Math.round((count / total) * 100));
    // Writer.appendData(Data);
    if (failedReq.length > 0) {
      console.error(`${failedReq.length} Ad got Failed Retry Latter`);
      console.error('Proccess Failed');
    }
  }
  // Writer.close();
  onEvent('complete', 'done');
  console.log('DOne.......');
  console.log(`file Saved in ${filepath}`);
}

console.log('starting');

// proxy
const L = setLoggerCallback(() => {});
const Pl = new ProxyList(L);
const proxy = [
  'http://bobsqalq:aheiwvfphsoz@188.74.183.10:8279',
  'http://bobsqalq:aheiwvfphsoz@188.74.210.21:6100',
  'http://bobsqalq:aheiwvfphsoz@45.155.68.129:8133',
  'http://bobsqalq:aheiwvfphsoz@154.95.36.199:6893',
];
const filters: filterDataType = {
  localitate: {
    nume: '',
    id: '',
    id_judet: '',
    nume_judet: '',
    id_localitate: 13822,
    nume_localitate: '',
    tip: 0,
    id_zona: '',
  },
  zone: null,
  proprietate: Proprietate.apartment,
  tranzactie: Tranzactie.Devânzare,
};

(async () => {
  for (const e of proxy) {
    const pp = await Pl.addProxy(e);
    if (pp) console.log('proxy Parse', (pp as Proxy).getProxyString().full);
  }
  console.log('AFter proxy load');

  startAll(
    { filters, filepath: './' },
    (e, d) => {
      console.log(e, ':', d);
    },
    Pl,
  );
})();
