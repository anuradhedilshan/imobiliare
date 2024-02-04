// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { ipcRenderer } from 'electron';
import { LocationType, filterDataType } from '../renderer/filter/types.d';
import { IPCMainHandler as IPCMainHandlerType } from './render';

const IPCMainHandler: IPCMainHandlerType = {
  getSuggestLocations: async (e: string): Promise<LocationType[]> => {
    const data = await ipcRenderer.invoke('getSuggestLocations', e);
    return data;
  },
  startAll: (filters: filterDataType, filepath: string) => {
    ipcRenderer.send('start', { filters, filepath });
  },
  onEvent: null,
  onStatus: null,
  openPathDialog: async () => {
    const e = await ipcRenderer.invoke('openPathDialog');
    return e.filePaths;
  },
  async getDataStatus(filter: filterDataType) {
    ipcRenderer.send('getDataStatus', filter);
  },
};

window.IPCMainHandler = IPCMainHandler;

function sendEvent(
  Type: 'progress' | 'count' | 'complete' | 'error' | 'details' | 'warn',
  message: number | boolean | string | null,
) {
  if (window.IPCMainHandler.onEvent)
    window.IPCMainHandler.onEvent(Type, message);
}

ipcRenderer.on('event', (_e, arg) => {
  console.log('onEvent');

  sendEvent(arg.Type, arg.p);
});

ipcRenderer.on('dataUpdate', (_e, arg) => {
  if (window.IPCMainHandler.onStatus) window.IPCMainHandler.onStatus(arg);
});

export type ElectronHandler = typeof IPCMainHandler;
