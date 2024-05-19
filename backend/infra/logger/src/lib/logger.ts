export type LoggerParams = {
  message: string;
  context?: unknown | Error;
};
export interface Logger {
  info(params: LoggerParams): void;
  error(params: LoggerParams): void;
  warn(params: LoggerParams): void;
  debug(params: LoggerParams): void;
}
