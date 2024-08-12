import { z } from 'zod';

const databaseEnvSchema = z.object({
  DATABASE_PORT: z.coerce.number(),
  DATABASE_NAME: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_USERNAME: z.string(),
  DATABASE_POOL_MAX_CONNECTIONS: z.coerce.number().optional().default(10),
});

const DATABASE_ENVS = databaseEnvSchema.parse(process.env);
export { DATABASE_ENVS };
