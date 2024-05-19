import pino, { LoggerOptions } from 'pino';
import pretty from 'pino-pretty';
import { Logger, LoggerParams } from '../logger';

process.env['NODE_ENV'] = process.env['NODE_ENV'] || 'development';

export class LoggerPino implements Logger {
  private logger: pino.Logger;

  constructor() {
    const destination = pino.destination({ sync: true });
    let transport: LoggerOptions['transport'];
    let level: LoggerOptions['level'];
    let formatters: LoggerOptions['formatters'];
    if (process.env['NODE_ENV'] === 'test-debug') {
      this.logger = pino({ level: 'trace' }, pretty({ sync: true }));
      return;
    }

    switch (process.env['NODE_ENV']) {
      case 'production':
      case 'homolog':
        level = 'info';
        formatters = {
          level: (label: string) => {
            return { level: label.toUpperCase() };
          },
        };
        break;
      case 'test':
        level = 'silent';
        break;
      case 'development':
        level = 'trace';
        transport = {
          target: 'pino-pretty',
          options: { colorize: true },
        };
        break;
      default:
        level = 'info';
        break;
    }
    this.logger = pino(
      {
        transport,
        formatters,
        timestamp: pino.stdTimeFunctions.isoTime,
        level,
      },
      destination
    );
  }

  info(params: LoggerParams): void {
    const { message, context } = params;
    this.logger.info({ context }, message);
  }

  error(params: LoggerParams): void {
    const { message, context } = params;
    this.logger.error({ context }, message);
  }

  warn(params: LoggerParams): void {
    const { message, context } = params;
    this.logger.warn({ context }, message);
  }

  debug(params: LoggerParams): void {
    const { message, context } = params;
    this.logger.debug({ context }, message);
  }
}

export const logger = new LoggerPino();
