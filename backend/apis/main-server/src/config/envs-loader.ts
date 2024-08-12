import { config as LoadEnvs } from 'dotenv';
const isTesting = process.env.NODE_ENV === 'test';
const envsFilesToLoad = ['.env', '.env.local'];
if (isTesting) {
  envsFilesToLoad.push('.env.test');
}
LoadEnvs({
  override: true,
  path: envsFilesToLoad,
  debug: Boolean(process.env.DEBUG),
});
