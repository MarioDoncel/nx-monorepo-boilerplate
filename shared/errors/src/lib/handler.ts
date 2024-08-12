import { env } from 'process';
import { ApplicationError } from './app-error';
import { ExceptionCatcher } from '@monorepo/exception-catcher';

interface ErrorHandlerResponse {
  statusCode: number;
  message: string;
  traceCode?: string;
  timestamp: string;
}

function isApplicationError(error: Error): error is ApplicationError {
  return error instanceof ApplicationError;
}

function isErrorReportable(error: Error) {
  const environment = env['NODE_ENV'] ?? 'development';
  const isNotDevelopmentEnviroment = !['development', 'test', 'local'].includes(
    environment
  );
  const isNotApiErrorAndNotReportable = !(
    isApplicationError(error) && !error.isReportable
  );
  return isNotDevelopmentEnviroment && isNotApiErrorAndNotReportable;
}
function generateResponse({
  traceCode,
  message,
  statusCode,
}: {
  statusCode: number;
  message: string;
  traceCode?: string;
}): ErrorHandlerResponse {
  return {
    statusCode,
    message,
    traceCode,
    timestamp: new Date().toISOString(),
  };
}
export class ErrorHandler {
  constructor(private exceptionCatcher: ExceptionCatcher) {}
  public handle(error: Error): ErrorHandlerResponse {
    if (isErrorReportable(error)) {
      this.exceptionCatcher.catchException({
        exception: error,
        tags: isApplicationError(error) ? error.tags : undefined,
      });
    }
    if (isApplicationError(error)) {
      const { message, statusCode, traceCode } = error;
      return generateResponse({ message, statusCode, traceCode });
    }
    return generateResponse({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
