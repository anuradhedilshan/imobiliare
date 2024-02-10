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
import { CB, Proprietate, Tranzactie } from './types';
import { filterDataType } from '../renderer/filter/types.d';
import Logger from './Logger';
import JSONWriter from './JSONWriter';
import ProxyList from '../proxy';
import Proxy from '../proxy/Proxy';

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
      logger?.warn('Invalid Filter Options');
      return false;
    }
    return true;
  },
  retryDelay(retryCount, error) {
    logger?.warn(`Requets Retry : ${retryCount} Times `);
    return retryCount * 5000;
  },
});

// getAdList
export async function getAnunturis(
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
    logger?.warn(`getAnunturis hit url : <br/> ${url}`);
    return data.data;
  } catch (e) {
    // console.log(e);

    logger?.error(`Reqest tried 3 times due to : <b>${e}</b> @getAnunturis`);
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

const Thread = 10;

function setLoggerCallback(cb: CB): Logger {
  logger = new Logger(cb);
  return logger;
}

// startAll

async function startAll(
  webcontent: IpcMainEvent,
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
  logger?.warn(`Prosess Started...${JSON.stringify(filters)}`);
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
    logger?.error('getAdsCount Failed In Engine.ts');
    webcontent.reply('dataUpdate', {
      total: 'n/A',
      titlu: 'Data Not Available',
      categorie: 'N/A',
      tranzactie: 'N/A',
      filename: 'N/A',
    });
    onEvent('complete', 'Failed');
    return;
  }

  const { total, titlu, categorie, tranzactie, id_lista } = ads as any;
  const Writer = new JSONWriter(filepath, he.decode(titlu));
  // send StatusUpdateEvent
  logger?.log(`Got ${total} Ads in ${titlu}`);
  webcontent.reply('dataUpdate', {
    total,
    titlu,
    categorie,
    tranzactie,
    filename: `${filepath}/${he.decode(titlu)}.json`,
  });
  let failedReq: string[] = [];
  // Runner
  for (let loop = 0; loop <= total + Thread; loop += Thread) {
    logger?.log(`Total : ${total} -  loop :  ${loop}`);
    const promises = [];
    let failed = 0;
    const Data: any[] = [];
    let retryCount = 3;
    let a: any = null;
    while (retryCount > 0) {
      const proxy = retryCount === 1 ? null : await proxylist.getProxy();
      logger?.warn(
        `getAnunturis time : ${retryCount} with : ${proxy?.getProxyString()
          .full}`,
      );
      a = await getAnunturis(
        filters.tranzactie,
        filters.proprietate,
        filters.localitate.id_localitate,
        loop,
        Thread,
        proxy,
      );
      if (a.anunturi.length > 0) break;
      retryCount -= 1;
    }

    logger?.warn(
      `${failedReq.length} Requests Failed : ${a.anunturi.length}  have to send`,
    );

    if (failedReq.length > 0) a.anunturi = a.anunturi.concat(failedReq);
    logger?.log(`After concat  : ${a.anunturi.length}  have to send`);
    failedReq = [];
    if (a.anunturi.length === 0) break;

    // get Random proxy
    const proxy = await proxylist.getProxy();
    for (const i of a.anunturi) {
      await sleep(100);
      promises.push(
        proxy
          .fetch(getAnunturiUrl(i.id), headers)
          .then(({ data, status }: AxiosResponse) => {
            // logger?.log(`${count} : got ${i.id} - ${status}`);
            if (status !== 200 || data.status !== 'success')
              throw new Error(`${i.id} requests failed`);
            delete data.data.poze;
            Data.push(data.data);
            count += 1;
            return i.id;
          })
          .catch((e: AxiosError) => {
            logger?.error(`Reqest Failed ${i.id} : ${e.message}`);
            if (e.response?.status !== 400) {
              failed += 1;
              failedReq.push(i);
              proxy.setWait();
            }
          }),
      );
    }
    await Promise.all(promises);
    logger?.log(`Got ${count} ads`);
    onEvent('progress', Math.round((count / total) * 100));
    Writer.appendData(Data);
    if (failedReq.length > 0) {
      logger?.error(`${failedReq.length} Ad got Failed Retry Latter`);
      logger?.error('Proccess Failed');
    }
  }
  Writer.close();
  logger?.log('Wait...........');
  setTimeout(() => {
    onEvent('complete', 'done');
    logger?.log('DOne.......');
    logger?.log(`file Saved in ${filepath}`);
  }, 10000);
}

export { startAll, setLoggerCallback };
