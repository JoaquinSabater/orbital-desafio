import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const entero = (valor, porDefecto) => {
  const numero = Number.parseInt(valor, 10);
  return Number.isNaN(numero) ? porDefecto : numero;
};

export const config = Object.freeze({
  port: entero(process.env.PORT, 3001),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  db: Object.freeze({
    host: process.env.DB_HOST || 'localhost',
    port: entero(process.env.DB_PORT, 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'orbital',
    connectionLimit: entero(process.env.DB_CONNECTION_LIMIT, 10),
  }),
});
