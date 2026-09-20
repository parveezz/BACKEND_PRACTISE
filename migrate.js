import db from "./src/config/db.js";

async function run() {
    try {
        // 1. Add missing columns to users table safely
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);
        console.log("Successfully updated 'users' table columns!");
        
        // 2. Create the user_images table safely
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_images (
                id SERIAL PRIMARY KEY,
                user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
                image_url TEXT NOT NULL,
                cloudinary_public_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Successfully created 'user_images' table!");
        process.exit(0);
    } catch(e) {
        console.error("Migration error:", e);
        process.exit(1);
    }
}
run();

