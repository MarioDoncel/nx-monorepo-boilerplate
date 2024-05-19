import { InMemoryDataStore } from "../in-memory-data-store";

export interface UseCaseCacheDecoratorOptions {
  ttl: number; // in seconds
  keys: string[];
}

interface UseCase {
  execute(...args: any): Promise<unknown>
}

export class UseCaseCacheDecorator {
  constructor(
    private readonly useCase: UseCase,
    private readonly options: UseCaseCacheDecoratorOptions,
    private readonly cache: InMemoryDataStore
  ) {}

  async execute(...args: any) {
    const receivedKey = JSON.stringify(args);
    const isKeyTracked = this.options.keys.includes(receivedKey);
    if (!isKeyTracked) {
      return this.useCase.execute(...args);
    }
    const cachedValue = await this.getFromCache(receivedKey);
    if (cachedValue) {
      return cachedValue;
    }
    const result = await this.useCase.execute(...args);
    await this.saveToCache(receivedKey, result);
    return result;
  }

  private async getFromCache(key: string) {
    try {
      const cachedValue = await this.cache.queryString(key);
      if (!cachedValue) {
        return null;
      }
      return JSON.parse(cachedValue);
    } catch (error) {
      //! Log/Capture error
      return null;
    } //* This way we are not depending on the cache to be available to have the application working
  }

  private async saveToCache(key: string, value: unknown) {
    try {
      const stringValue = JSON.stringify(value);
      await this.cache.setString(key, stringValue, { expireInSeconds: this.options.ttl });

    } catch (error) {
      //! Log/Capture error
    } //* This way we are not depending on the cache to be available to have the application working
  }
}
