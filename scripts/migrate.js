import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import db from '../src/config/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    let exitCode = 0;

    try {
        const migrationFile = process.argv[2] || '001_create_users_table.sql';
        const sqlFilePath = path.resolve(__dirname, '../migrations', migrationFile);
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        await db.query(sql);
    } catch (error) {
        console.error('Migration failed:', error);
        exitCode = 1;
    } finally {
        await db.end();
        process.exit(exitCode);
    }
}

runMigration();
