import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { z } from 'zod';
import { ExceptionCatcher } from '../exception-catcher';

const envSchema = z.object({
  SENTRY_DSN: z.string(),
});
const { SENTRY_DSN } = envSchema.parse(process.env);

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env['NODE_ENV'] ?? 'development',
  integrations: [
    // Add our Profiling integration
    // nodeProfilingIntegration(),
  ],

  tracesSampleRate: 1.0, //* Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring. We recommend adjusting this value in production
  profilesSampleRate: 1.0, //* Set profilesSampleRate to 1.0 to capture 100% of profiles for performance monitoring
  // replaysSessionSampleRate: 0.1, //* Capture Replay for 10% of all sessions
  // replaysOnErrorSampleRate: 1.0, //* plus for 100% of sessions with an error
});

export class SentryExceptionCatcher implements ExceptionCatcher {
  catchException({
    exception,
    tags,
  }: {
    exception: Error;
    tags?: { [key: string]: string };
  }): void {
    Sentry.captureException(exception, { tags });
  }
}
export const sentryExceptionCatcher = new SentryExceptionCatcher();
