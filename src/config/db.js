
import { Pool } from "pg";

const pool = new Pool({
      user: process.env.DB_USERNAME,
      host: process.env.DB_HOSTNAME,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
});

export default pool;