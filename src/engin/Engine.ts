/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import axiosRetry from 'axios-retry';
import { IpcMainEvent } from 'electron';
import he from 'he';
import { CB, Proprietate, Tranzactie } from './types';
import { filterDataType } from '../renderer/filter/types.d';
import Logger from './Logger';
import JSONWriter from './JSONWriter';

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
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// getAdList
async function getAnunturis(
  t: Tranzactie,
  c: Proprietate,
  l: string | number,
  offset: number,
  limit: number,
): Promise<any> {
  const url = `https://apirm.imobiliare.ro/2.2/anunturi?tranzactie=${t}&categorie=${c}${
    /* &tip_proprietate=2,3,1,4 */ ''
  }&localitati=${l}&sortare=sctl&offset=${offset}&limit=${limit}`;
  try {
    const { status, data } = await axios.get(url, { headers });
    if (status !== 200 || data.status !== 'success')
      throw new Error('request failed');
    return data.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// getAd
async function getAnunturi(id: string): Promise<AxiosResponse> {
  const url = `https://apirm.imobiliare.ro/2.2/anunturi/${id}`;

  return axios.get(url, { headers });
}

const Thread = 4;
let logger: Logger | null = null;

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
) {
  logger?.warn(`Prosess Started...${JSON.stringify(filters)}`);
  let count = 0;
  // getAdsCount
  const ads = await getAnunturis(
    filters.tranzactie,
    filters.proprietate,
    filters.localitate.id_localitate,
    0,
    0,
  );
  if (!ads) logger?.error('getAdsCount Failed In Engine.ts');
  const { total, titlu, categorie, tranzactie } = ads as any;
  const Writer = new JSONWriter(`${filepath}/${he.decode(titlu)}`);
  // send StatusUpdateEvent
  logger?.log(`Got ${total} Ads in ${titlu}`);
  webcontent.reply('dataUpdate', { total, titlu, categorie, tranzactie });
  // Runner
  for (let loop = 0; loop <= total; loop += Thread) {
    const promises = [];
    let failed = 0;
    const Data: any[] = [];
    const failedReq: string[] = [];
    const a = await getAnunturis(2, 4, 13822, loop, Thread);
    for (const i of a.anunturi) {
      await sleep(100);
      promises.push(
        getAnunturi(i.id)
          .then(({ data, status }: AxiosResponse) => {
            logger?.log(`${count} : got ${i.id} - ${status}`);
            if (status !== 200 || data.status !== 'success')
              throw new Error(`${i.id} requests failed`);
            delete data.data.poze;
            Data.push(data.data);
            count += 1;
            return data;
          })
          .catch((e: Error) => {
            logger?.error(`Reqest Failed ${i.id} : ${e.message}`);
            failed += 1;
            failedReq.push(i.id);
          }),
      );
    }
    await Promise.all(promises);
    onEvent('progress', Math.round((count / total) * 100));
    Writer.appendData(Data);
    if (failedReq.length > 0) {
      logger?.error(`${failedReq.length} Ad got Failed Retry Latter`);
      logger?.error('Proccess Failed');
      onEvent('complete', 'Failed');
      return;
    }
  }
  Writer.close();
  onEvent('complete', 'done');
  logger?.log('DOne.......');
  logger?.log(`file Saved in ${filepath}`);
}

export { startAll, setLoggerCallback };
