/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ipcMain, BrowserWindow, IpcMainEvent, dialog } from 'electron';
import he from 'he';
import { LocationType, filterDataType } from '../renderer/filter/types.d';
import { CB } from './types';
import { getAnunturis, setLoggerCallback, startAll } from './Engine';
import Logger from './Logger';

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
): Promise<LocationType[]> {
  if (pre === text) {
    console.log('load from cahe');
    return data;
  }
  const s = await (
    await fetch(
      `https://www.imobiliare.ro/sugestii-v2/tranzactie-2/${text}`,
      requestOptions,
    )
  ).json();
  pre = text;
  data = s.sugestii;
  return data;
}

class IPCMainHandler {
  private mainWindow: BrowserWindow | null;

  private f: CB;

  running = false;

  logger: Logger;

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
  }

  // Add more private methods for handling other IPC events
  private start(
    _e: IpcMainEvent,
    arg: { filters: filterDataType; filepath: string },
  ): void {
    this.logger.log(`startall : ${arg}`);
    if (!this.running) startAll(_e, arg, this.f);
    this.running = true;
  }

  // Cleanup method to remove event listeners
  public destroy(): void {
    ipcMain.removeAllListeners('MainEvents');
    // Remove listeners for other events
  }

  async getDataStatus(_e: IpcMainEvent, filter: filterDataType) {
    try {
      const ads = await getAnunturis(
        filter.tranzactie,
        filter.proprietate,
        filter.localitate.id_localitate,
        0,
        0,
      );
      if (!ads) this.logger?.error('getAdsCount Failed In IpcMain HAndler.ts');
      const { total, titlu, categorie, tranzactie } = ads as any;
      _e.reply('dataUpdate', {
        total,
        titlu: he.decode(titlu),
        categorie,
        tranzactie,
      });
    } catch (e) {
      this.logger.error(`${e}`);
    }
  }
}
export default IPCMainHandler;
