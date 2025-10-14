import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Создаем пул подключений
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT || '5432', 10),
});

pool.on('error', (err) => {
  console.error('Неожиданная ошибка в клиенте PG:', err);
  process.exit(-1);
});

export default pool;