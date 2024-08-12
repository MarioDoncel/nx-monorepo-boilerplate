const isProductionEnvironment = process.env['NODE_ENV'] === 'production';

//* Necessary to connect to AWS RDS
export const sslDefaultConfig = isProductionEnvironment
  ? {
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {};
