import axios from 'axios';
import { Tranzactie, Proprietate } from './types';
import Logger from './Logger';

export const JUDETS = [
  {
    judet_name: 'alba',
    id: '1000000',
  },
  {
    judet_name: 'arad',
    id: '1000755',
  },
  {
    judet_name: 'arges',
    id: '1001090',
  },
  {
    judet_name: 'bacau',
    id: '1001731',
  },
  {
    judet_name: 'bihor',
    id: '1002291',
  },
  {
    judet_name: 'bistrita-nasaud',
    id: '1002795',
  },
  {
    judet_name: 'botosani',
    id: '1003108',
  },
  {
    judet_name: 'braila',
    id: '1003468',
  },
  {
    judet_name: 'brasov',
    id: '1003656',
  },
  {
    judet_name: 'brasov',
    id: '1003670',
  },
  {
    judet_name: 'buzau',
    id: '1004278',
  },
  {
    judet_name: 'calarasi',
    id: '1004819',
  },
  {
    judet_name: 'caras-severin',
    id: '1005013',
  },
  {
    judet_name: 'cluj',
    id: '1005358',
  },
  {
    judet_name: 'cluj',
    id: '1005462',
  },
  {
    judet_name: 'constanta',
    id: '1005844',
  },
  {
    judet_name: 'constanta',
    id: '1005887',
  },
  {
    judet_name: 'covasna',
    id: '1006150',
  },
  {
    judet_name: 'dambovita',
    id: '1006303',
  },
  {
    judet_name: 'dolj',
    id: '1006718',
  },
  {
    judet_name: 'galati',
    id: '1007153',
  },
  {
    judet_name: 'giurgiu',
    id: '1007382',
  },
  {
    judet_name: 'gorj',
    id: '1007572',
  },
  {
    judet_name: 'harghita',
    id: '1008047',
  },
  {
    judet_name: 'hunedoara',
    id: '1008336',
  },
  {
    judet_name: 'ialomita',
    id: '1008899',
  },
  {
    judet_name: 'iasi',
    id: '1009057',
  },
  {
    judet_name: 'iasi',
    id: '1009254',
  },
  {
    judet_name: 'ilfov',
    id: '1003928',
  },
  {
    judet_name: 'maramures',
    id: '1009574',
  },
  {
    judet_name: 'mehedinti',
    id: '1009853',
  },
  {
    judet_name: 'mures',
    id: '1010244',
  },
  {
    judet_name: 'neamt',
    id: '1010816',
  },
  {
    judet_name: 'olt',
    id: '1011207',
  },
  {
    judet_name: 'prahova',
    id: '1011633',
  },
  {
    judet_name: 'salaj',
    id: '1012235',
  },
  {
    judet_name: 'satu-mare',
    id: '1012542',
  },
  {
    judet_name: 'sibiu',
    id: '1012820',
  },
  {
    judet_name: 'suceava',
    id: '1013055',
  },
  {
    judet_name: 'teleorman',
    id: '1013491',
  },
  {
    judet_name: 'timis',
    id: '1013754',
  },
  {
    judet_name: 'timis',
    id: '1014053',
  },
  {
    judet_name: 'tulcea',
    id: '1014168',
  },
  {
    judet_name: 'valcea',
    id: '1014346',
  },
  {
    judet_name: 'vaslui',
    id: '1015016',
  },
  {
    judet_name: 'vrancea',
    id: '1015509',
  },
];

export async function rafMultipluLoc(l: string, logger: Logger | null) {
  const url = 'https://www.imobiliare.ro/lista/raf-multiplu';
  const formData = new FormData();
  formData.append('iIdCautare', '70155546');
  formData.append('b_cautator_locatie_id', l);
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
    logger?.warn(`rafMultipluLoc post url : <br/> ${url}`);
    if (data.redirectLista) {
      const urlA = new URL(data.url);

      const id = urlA.searchParams.get('id');

      return id;
    }
    return null;
  } catch (e) {
    // console.error(e);

    logger?.error(`Reqest tried 3 times due to : <b>${e}</b> @rafMultipluLoc`);
    return null;
  }
}

export async function rafMultiplugetID(
  t: Tranzactie,
  c: Proprietate,
  cid: string,
  logger: Logger | null,
) {
  const url = 'https://www.imobiliare.ro/filtre-lista/obtine-filtre-mobil';
  const formData = new FormData();
  formData.append(
    'date_cautator[b_cautare_tranzactie_val]',
    t as unknown as string,
  );
  formData.append(
    'date_cautator[b_cautator_categorie_radio]',
    c as unknown as string,
  );
  formData.append('date_cautator[b_cautare_id_hidden]', cid);
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
    logger?.warn(`rafMultiplugetID post url : <br/> ${url}`);
    if (data.id_cautare) {
      return data.id_cautare;
    }
    return null;
  } catch (e) {
    // console.error(e);

    logger?.error(
      `Reqest tried 3 times due to : <b>${e}</b> @rafMultiplugetID`,
    );
    return null;
  }
}
