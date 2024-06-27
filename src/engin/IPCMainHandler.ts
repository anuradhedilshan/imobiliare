/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ipcMain, BrowserWindow, IpcMainEvent, dialog } from 'electron';
import he from 'he';
import { LocationType, filterDataType } from '../renderer/filter/types.d';
import { CB, Proprietate, Subcategorie } from './types';
import {
  rafMultiplu,
  setLoggerCallback,
  startAll,
  startAlloverContry,
} from './Engine';
import Logger from './Logger';
import ProxyList from '../proxy';
import Proxy from '../proxy/Proxy';

const myHeaders = new Headers();
myHeaders.append('uuid', '	efbc128b-0ad7-44b5-86fc-fe409aebffc7');
myHeaders.append('soapp', '	android');
myHeaders.append('rmkey', '	231jkda5fab#sGSf!xPt@');
myHeaders.append('accept-encoding', '	gzip');
myHeaders.append('user-agent', '	okhttp/4.9.0');

// eslint-disable-next-line no-undef
const requestOptions: RequestInit = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
  cache: 'force-cache',
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let pre = '';
let data = [
  {
    nume: 'DN 2 (zon&#259; &icirc;n Bucuresti)',
    id: 1004255,
    tip: 4,
    id_zona: 1397,
    id_localitate: 13822,
    nume_judet: 'Bucuresti Ilfov',
    id_judet: 10,
    nume_localitate: 'Bucuresti',
  },
];
export async function loadSuggestlocalitate(
  text: string,
): Promise<LocationType[] | null> {
  if (pre === text) {
    return data;
  }
  try {
    const s = await (
      await fetch(
        `https://www.imobiliare.ro/sugestii-v2/tranzactie-2/${text}`,
        requestOptions,
      )
    ).json();
    pre = text;
    data = s.sugestii;
    return data;
  } catch (e) {
    return null;
  }
}

const subcategorieObject = {
  Birouri: Subcategorie.Birouri,
  HoteluriPensiuni: Subcategorie.HoteluriPensiuni,
  SpatiiComerciale: Subcategorie.SpatiiComerciale,
  TerenuriInvestitii: Subcategorie.TerenuriInvestitii,
  SpatiiIndustriale: Subcategorie.SpatiiIndustriale,
  ProprietatiSpeciale: Subcategorie.ProprietatiSpeciale,
};

class IPCMainHandler {
  private mainWindow: BrowserWindow | null;

  private f: CB;

  running = false;

  logger: Logger;

  Pl: ProxyList;

  constructor(mainWindow: BrowserWindow) {
    this.f = (Type, p) => {
      if (Type === 'complete') {
        this.running = false;
      }
      if (this.mainWindow)
        this.mainWindow.webContents.send('event', { Type, p });
    };

    this.logger = setLoggerCallback(this.f);
    this.mainWindow = mainWindow;
    this.Pl = new ProxyList(this.logger);
    // Register IPC event handlers
    ipcMain.handle('getSuggestLocations', async (_e, arg) => {
      return loadSuggestlocalitate(arg);
    });

    ipcMain.on('start', this.start.bind(this));
    ipcMain.on('getDataStatus', this.getDataStatus.bind(this));
    ipcMain.handle('openPathDialog', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
      });
      return result;
    });
    ipcMain.handle('addProxy', async (_e, arg) => {
      return this.setProxyasync(arg);
    });
  }

  // Add more private methods for handling other IPC events
  private start(
    _e: IpcMainEvent,
    arg: { filters: filterDataType; filepath: string },
  ): void {
    this.logger.log(`starting : ${arg}`);
    if (this.Pl.getProxyCount() <= 0) {
      this.logger.error('no any proxy');
      return;
    }
    try {
      if (!this.running) {
        if (arg.filters.localitate.id_localitate === 9999999) {
          this.logger.log('startAll_overcountry');
          startAlloverContry(_e, arg, this.f, this.Pl);
        } else {
          this.logger.log('StartAll');
          startAll(_e, arg, this.f, this.Pl);
        }
      }
      // this.running = true;
    } catch (e) {
      this.logger.error(`StartALl rejected due to ${e}`);
    }
  }

  // Cleanup method to remove event listeners
  public destroy(): void {
    ipcMain.removeAllListeners('MainEvents');
    // Remove listeners for other events
  }

  private async setProxyasync(arg: string): Promise<
    {
      less: string;
      full: string;
    }[]
  > {
    const working = [];
    for (const i of arg.trim().split('\n')) {
      // eslint-disable-next-line no-await-in-loop
      const out = await this.Pl.addProxy(i);
      if (out) working.push((out as Proxy).getProxyString());
    }
    return working;
  }

  async getDataStatus(_e: IpcMainEvent, filters: filterDataType) {
    try {
      const multiplu = await rafMultiplu(
        filters.tranzactie,
        Subcategorie.Birouri,
        filters.proprietate,
        filters.localitate,
      );

      if (multiplu) {
        const { iIdCautare, aDetaliiTitlu, total } = multiplu;
        const titlu = he.decode(aDetaliiTitlu);
        _e.reply('dataUpdate', {
          total: ` ${(filters.proprietate as unknown as string) === Proprietate.commercial.toString() ? 'cannot calculate' : total}`,
          titlu,
          categorie: filters.proprietate,
          tranzactie: filters.tranzactie,
          filename: `iIdCautare : ${iIdCautare}`,
        });
      } else {
        this.logger?.error('getAdsCount Failed In IpcMain HAndler.ts');
        _e.reply('dataUpdate', {
          total: 'n/A',
          titlu: 'Data Not Available',
          categorie: 'N/A',
          tranzactie: 'N/A',
          filename: 'N/A',
        });
      }
    } catch (e) {
      this.logger.error(`${e}`);
    }
  }
}
export default IPCMainHandler;
