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
import { CB, Proprietate, Tranzactie } from './types';
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
  c: Proprietate,
  l: LocationType,
) {
  const url = 'https://www.imobiliare.ro/lista/raf-multiplu';
  const formData = new FormData();
  formData.append('iSubcategorie', c.toString());
  formData.append('sSortare', 'tl-none');
  formData.append('aLocalizare[]', 'judet');
  formData.append(
    'aLocalizare[]',
    l.id_localitate === '' ? '' : `l${l.id_localitate}`,
  );
  formData.append('aLocalizare[]', l.id_zona === '' ? '' : `z${l.id_zona}`);
  formData.append('date_cautator[tDataLimitaInregistrareLicitatie]', '2162');
  formData.append('date_cautator[b_cautare_tranzactie_val]', t.toString());
  formData.append('date_cautator[b_cautare_id_hidden]', '70155546');
  formData.append('tDataLimitaInregistrareLicitatie', '2162');
  formData.append('date_cautator[b_cautator_categorie_radio]', c.toString());

  logger?.log(new URLSearchParams(formData as any).toString());
  try {
    const { status, data } = await axios.post(url, formData, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    });
    if (status !== 200) throw new Error('request failed');
    logger?.warn(`getAnunturis hit url : <br/> ${url}`);
    return {
      iIdCautare: data.iIdCautare,
      aDetaliiTitlu: data.aDetaliiTitlu,
      total: data.total,
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
  '101': 'apartment',
  '102': 'house_vile',
  '108': 'terrain',
  '202': 'commercial',
};
const T = {
  '1': 'Devânzare',
  '2': 'Deînchiriat',
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
  const multiplu = await rafMultiplu(
    filters.tranzactie,
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

  const titlu = he.decode(aDetaliiTitlu.titlu);
  const Writer = new JSONWriter(filepath, titlu, logger);
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
  const jsonHeader = getHeaders(
    P[filters.proprietate],
    T[filters.tranzactie],
    filters.localitate.nume,
  );
  Writer.writeHeader(jsonHeader);
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

  const ilename = `${Proprietate[filters.proprietate]}_${Tranzactie[filters.tranzactie]}_alloverCountry`;
  const Writer = new JSONWriter(filepath, ilename, logger);
  const jsonHeader = getHeaders(
    P[filters.proprietate],
    T[filters.tranzactie],
    filters.localitate.nume,
  );
  Writer.writeHeader(jsonHeader);
  let count = 0;
  let Jcount = 0;
  // getAdsCount
  for (const judet of JUDETS) {
    logger?.warn(`fetching ${judet.judet_name}`);
    const id = await rafMultipluLoc(judet.id, logger);
    if (id === null) {
      logger?.error(`id Null in ${judet.id}:${judet.judet_name}`);
      // eslint-disable-next-line no-continue
      continue;
    }

    const iIdCautare = await rafMultiplugetID(
      filters.tranzactie,
      filters.proprietate,
      id,
      logger,
    );

    const p = await proxylist.getProxy();

    let ads: any[] = await getAnunturisHarta(iIdCautare, p);
    // if (!ads) {
    //   logger?.error('getAdsCount Failed In Engine.ts');
    //   webcontent.reply('dataUpdate', {
    //     total: 'n/A',
    //     titlu: `Get All over Country - ${judet.judet_name}`,
    //     categorie: 'N/A',
    //     tranzactie: 'N/A',
    //     filename: 'N/A',
    //   });
    //   onEvent('complete', 'Failed');
    //   return;
    // }
    ads = Object.entries(ads);

    // send StatusUpdateEvent
    logger?.log(`Got ${ads.length} Ads in ${judet.judet_name}`);
    webcontent.reply('dataUpdate', {
      total: ads.length,
      titlu: `judget-${judet.judet_name}`,
      categorie: filters.proprietate,
      tranzactie: filters.tranzactie,
      filename: `${ilename}.json`,
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
