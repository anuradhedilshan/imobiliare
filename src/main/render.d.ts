import { CB } from '../engin/types';
import { LocationType, filterDataType } from '../renderer/filter/types.d';

export interface IPCMainHandler {
  getSuggestLocations: (e: string) => Promise<LocationType[]>;
  startAll: (filters: filterDataType, filepath: string) => void;
  onEvent: CB | null;
  onStatus: ((arg: any) => void) | null;
  openPathDialog: () => Promise<any>;
  getDataStatus: (filter: filterDataType) => void;
  addProxy: (e: string) => Promise<
    {
      less: string;
      full: string;
    }[]
  >;
}

declare global {
  interface Window {
    IPCMainHandler: IPCMainHandler;
  }
}
