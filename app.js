import "dotenv/config";
import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import imageRoutes from "./src/routes/imageRoutes.js";
import videoRoutes from "./src/routes/videoRoutes.js";
import generalRoutes from "./src/routes/generalRoutes.js";
import errorHandlerMiddleware from "./src/middleware/errorHandlerMiddleware.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

const app = express();

// Security Headers
app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/images", imageRoutes);
app.use("/videos", videoRoutes);
app.use("/", generalRoutes);

const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL('./docs/swagger.json', import.meta.url))
);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// Global Error Handler (must be the last middleware)
app.use(errorHandlerMiddleware);

export default app;

