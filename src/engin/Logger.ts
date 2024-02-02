/* eslint-disable camelcase */
import { CB } from './types';

export default class Logger {
  private Callback!: CB;

  constructor(event_callback: CB) {
    this.Callback = event_callback;
  }

  error(message: number | boolean | string | null) {
    this.Callback('error', message);
  }

  log(message: number | boolean | string | null) {
    this.Callback('details', message);
  }

  warn(message: number | boolean | string | null) {
    this.Callback('warn', message);
  }
}
