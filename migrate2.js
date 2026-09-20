import db from "./src/config/db.js";
import fs from "fs";

async function run() {
    try {
        const sql = fs.readFileSync("migrations/003_add_avatar_to_users.sql", "utf-8");
        await db.query(sql);
        console.log("Migration successful");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();

