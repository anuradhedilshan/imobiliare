/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import axiosRetry from 'axios-retry';
import { Proprietate, Tranzactie } from '../renderer/filter/types.d';

const headers: RawAxiosRequestHeaders = {
  uuid: 'efbc128b-0ad7-44b5-86fc-fe409aebffc7',
  soapp: 'android',
  rmkey: '231jkda5fab#sGSf!xPt@',
  'accept-encoding': 'gzip',
  'user-agent': 'okhttp/4.9.0',
};

// Configure axios to use axios-retry
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

async function getAnunturi(id: string): Promise<AxiosResponse> {
  console.log('ged Ad', id);

  const url = `https://apirm.imobiliare.ro/2.2/anunturi/${id}`;

  return axios.get(url, { headers });
}

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

const Thread = 20;
const GlobleData: any[][] = [];
async function startAll() {
  const ads = await getAnunturis(2, 4, 13822, 0, 0);
  if (!ads) console.log('Failed');
  const { total, titlu, categorie, tranzactie } = ads as any;
  let count = 0;
  // runner
  for (let loop = 10; loop <= total; loop += Thread) {
    const promises = [];
    let failed = 0;
    const Data: any[] = [];
    const failedReq = [];
    const a = await getAnunturis(2, 4, 13822, loop, Thread);
    for (const i of a.anunturi) {
      promises.push(
        getAnunturi(i.id)
          .then(({ data, status }: AxiosResponse) => {
            console.log(data);
            if (status !== 200 || data.status !== 'success')
              throw new Error(`${i.id} requests failed`);
            delete data.data.poze;
            Data.push(data.data);
            count += 1;
            return data;
          })
          .catch((e) => {
            console.log(e);
            failed += 1;
            failedReq.push(i.id);
          }),
      );
      await Promise.all(promises);
    }
    GlobleData.push(Data);
  }
  console.log('Count', count);
  console.log('Count', GlobleData);
}
startAll();
