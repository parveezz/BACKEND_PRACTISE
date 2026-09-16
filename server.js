import app from "./app.js";
import db from "./src/config/db.js";

const port = process.env.PORT || 4002;

app.listen(port, async () => {
      try {
            await db.query("select now()");
            console.log(`Server listening on http://localhost:${port}`);
      } catch (err) {
            console.error("Database connection failed", err);
      }
});