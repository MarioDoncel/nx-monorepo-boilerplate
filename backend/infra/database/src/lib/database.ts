export interface Database {
  connectClient(): Promise<void>;
  connectPool(): Promise<void>;
  query<T extends unknown[]>(query: string, values: unknown[]): Promise<T>;
  closeConnection(): Promise<void>;
  runQueriesInATransaction<T = unknown[]>(
    queries: { query: string; values: (string | number | Date | null)[] }[]
  ): Promise<T>;
  getTransactionInstance(): Promise<Database>;
}
