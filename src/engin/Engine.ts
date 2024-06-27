/* eslint-disable no-dupe-keys */
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
import { CB, Proprietate, Subcategorie, Tranzactie } from './types';
import { LocationType, filterDataType } from '../renderer/filter/types.d';
import Logger from './Logger';
import JSONWriter from './JSONWriter';
import ProxyList from '../proxy';
import Proxy from '../proxy/Proxy';
import { JUDETS, rafMultipluLoc, rafMultiplugetID } from './GetAll';

let logger: Logger | null = null;
function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const headers: RawAxiosRequestHeaders = {
  uuid: '9b2864d5-473c-419c-a332-ce425c6b1e1d',
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
export async function getAnunturisHarta(
  lista: string,
  proxy: Proxy | null,
): Promise<any> {
  const url = `https://apirm.imobiliare.ro/2.2/lista_harta_anunturi?lista=${lista}`;
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
// raf-multiplu
export async function rafMultiplu(
  t: Tranzactie,
  S: Subcategorie,
  c: Proprietate,
  l: LocationType,
) {
  const url = `https://apirm.imobiliare.ro/2.2/anunturi?localitati=${l.id_localitate}&subcategorie=${S}&categorie=${c}&offset=0&sortare=sctl&tranzactie=${t}&limit=0`;
  logger?.log(url);
  try {
    const { status, data } = await axios.get(url, {
      headers,
    });
    if (status !== 200) throw new Error('request failed');
    logger?.warn(`getAnunturis hit url : <br/> ${url}`);

    return {
      iIdCautare: data.data.id_lista,
      aDetaliiTitlu: data.data.titlu,
      total: data.data.total,
      id_vizitator: data.data.id_vizitator,
    };
  } catch (e) {
    // console.error(e);

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

const Thread = 100;

function setLoggerCallback(cb: CB): Logger {
  logger = new Logger(cb);
  return logger;
}

function getHeaders(p: string, t: string, location: string) {
  const header = `"date" : "${new Date().toISOString()}",\n"property type" : "${p}" , \n "transaction type" :"${t}" , \n "location" : "${location}" \n`;
  return header;
}
// startAll

const P = {
  '1': 'apartment',
  '2': 'house_vile',
  '4': 'terrain',
  '5': 'commercial',
};
const T = {
  '1': 'Devânzare',
  '2': 'Deînchiriat',
};

const subcategorieObject = {
  Birouri: Subcategorie.Birouri,
  HoteluriPensiuni: Subcategorie.HoteluriPensiuni,
  SpatiiComerciale: Subcategorie.SpatiiComerciale,
  TerenuriInvestitii: Subcategorie.TerenuriInvestitii,
  SpatiiIndustriale: Subcategorie.SpatiiIndustriale,
  ProprietatiSpeciale: Subcategorie.ProprietatiSpeciale,
};
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
  // Commercial
  const sub =
    filters.subcategorie === Subcategorie.All
      ? Object.values(subcategorieObject)
      : [filters.subcategorie];

  const titlu = `${filters.localitate.nume}_${Proprietate[filters.proprietate]}_${Subcategorie[filters.subcategorie]}_${Tranzactie[filters.tranzactie]}`;
  const Writer = new JSONWriter(filepath, titlu, logger);
  const jsonHeader = getHeaders(
    P[filters.proprietate],
    T[filters.tranzactie],
    filters.localitate.nume,
  );
  Writer.writeHeader(jsonHeader);
  for (const subcat of sub) {
    logger?.log(`subcategorie -> ${subcat}`);

    const multiplu = await rafMultiplu(
      filters.tranzactie,
      subcat,
      filters.proprietate,
      filters.localitate,
    );
    if (!multiplu) {
      logger?.error('rafMultifu Failed');
      return;
    }
    const { iIdCautare, aDetaliiTitlu, total } = multiplu;

    const p = await proxylist.getProxy();

    let ads: any[] = await getAnunturisHarta(iIdCautare, p);
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
    ads = Object.entries(ads);

    // send StatusUpdateEvent
    logger?.log(`Got ${total} Ads in ${titlu}`);
    webcontent.reply('dataUpdate', {
      total,
      titlu,
      categorie: filters.proprietate,
      tranzactie: filters.tranzactie,
      filename: `${titlu}.json`,
    });
    let failedReq: string[] = [];

    // Runner
    for (let loop = 0; loop <= ads.length + Thread; loop += Thread) {
      logger?.warn(`Total : ${ads.length} -  loop :  ${loop}`);
      await sleep(10);
      const promises = [];
      let failed = 0;
      const Data: any[] = [];
      let a: any = null;

      a = ads.slice(loop, loop + Thread);

      logger?.log(`${failedReq.length} : requets failed *retring* `);
      if (failedReq.length > 0) a = a.concat(failedReq);
      logger?.log(`After concat  : ${a.length}  have to send`);
      failedReq = [];
      if (a.length === 0) break;

      // get Random proxy
      const proxy = await proxylist.getProxy();
      for (const i of a) {
        await sleep(100);
        logger?.log(`pushed ${i}`);
        promises.push(
          proxy
            .fetch(getAnunturiUrl(i[1].a), headers)
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
  }

  Writer.close();
  logger?.log('Wait...........');
  onEvent('progress', 100);
  setTimeout(() => {
    onEvent('progress', 200);
    onEvent('complete', 'done');
    logger?.log('DOne.......');
    logger?.log(`file Saved in ${filepath}`);
  }, 10000);
}

async function startAlloverContry(
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
  logger?.warn(`Prosess Started... Start ALL Over`);
  logger?.warn(`Prosess Started...`);

  const titlu = `${filters.localitate.nume}_${Proprietate[filters.proprietate]}_${Subcategorie[filters.subcategorie]}_${Tranzactie[filters.tranzactie]}`;
  const Writer = new JSONWriter(filepath, titlu, logger);
  const jsonHeader = getHeaders(
    P[filters.proprietate],
    T[filters.tranzactie],
    filters.localitate.nume,
  );
  Writer.writeHeader(jsonHeader);
  let count = 0;
  let Jcount = 0;
  // getAdsCount
  // console.log(filters.proprietate, Proprietate.commercial);

  const sub =
    parseInt(filters.proprietate as unknown as string, 10) ===
    Proprietate.commercial
      ? Object.values(subcategorieObject)
      : [filters.subcategorie];

  for (const judet of JUDETS) {
    logger?.warn(`fetching ${judet.judet_name}`);
    for (const subcat of sub) {
      logger?.log(`subcategorie -> ${subcat}`);
      filters.subcategorie = subcat;
      const d = await rafMultipluLoc(judet.id, headers, filters, logger);
      if (d === null) {
        logger?.error(`id Null in ${judet.id}:${judet.judet_name}`);
        // eslint-disable-next-line no-continue
        continue;
      }

      const p = await proxylist.getProxy();

      let ads: any[] = await getAnunturisHarta(d.iIdCautare, p);

      ads = Object.entries(ads);

      // send StatusUpdateEvent
      logger?.log(`Got ${ads.length} Ads in ${judet.judet_name}`);
      webcontent.reply('dataUpdate', {
        total: ads.length,
        titlu: `judget-${judet.judet_name}`,
        categorie: filters.proprietate,
        tranzactie: filters.tranzactie,
        filename: `${titlu}.json`,
      });
      let failedReq: string[] = [];
      // eslint-disable-next-line no-continue
      // Runner
      for (let loop = 0; loop <= ads.length + Thread; loop += Thread) {
        logger?.warn(`Total : ${ads.length} -  loop :  ${loop}`);
        await sleep(10);
        const promises = [];
        let failed = 0;
        const Data: any[] = [];
        let a: any = null;

        a = ads.slice(loop, loop + Thread);

        logger?.log(`${failedReq.length} : requets failed *retring* `);
        if (failedReq.length > 0) a = a.concat(failedReq);
        logger?.log(`After concat  : ${a.length}  have to send`);
        failedReq = [];
        if (a.length === 0) break;

        // get Random proxy
        const proxy = await proxylist.getProxy();
        for (const i of a) {
          await sleep(100);
          logger?.log(`pushed ${i}`);
          promises.push(
            proxy
              .fetch(getAnunturiUrl(i[1].a), headers)
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
        Writer.appendData(Data);
        if (failedReq.length > 0) {
          logger?.error(`${failedReq.length} Ad got Failed Retry Latter`);
          logger?.error('Proccess Failed');
        }
      }
      Jcount += 1;
      onEvent('progress', Math.round((Jcount / JUDETS.length) * 100));
    }
  }
  Writer.close();
  logger?.log('Wait...........');
  onEvent('progress', 100);
  setTimeout(() => {
    onEvent('progress', 200);
    onEvent('complete', 'done');
    logger?.log('DOne.......');
    logger?.log(`file Saved in ${filepath}`);
  }, 10000);
}

export { startAll, setLoggerCallback, startAlloverContry };
