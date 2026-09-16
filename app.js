import "dotenv/config";
import express, { json, urlencoded } from "express";
import authRoutes from "./src/routes/authRoutes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

const app = express();

app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);

const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL('./docs/swagger.json', import.meta.url))
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Server</title>
      </head>

      <body style="
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color:blue;
        font-family: Arial, sans-serif;
      ">
        <h1 style="
          color: white;
          font-size: 58px;
        ">
          Server is Running
        </h1>
      </body>
    </html>
  `);
});

export default app;

