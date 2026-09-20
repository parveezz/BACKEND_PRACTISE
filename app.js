import "dotenv/config";
import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import imageRoutes from "./src/routes/imageRoutes.js";
import videoRoutes from "./src/routes/videoRoutes.js";
import generalRoutes from "./src/routes/generalRoutes.js";
import errorHandlerMiddleware from "./src/middleware/errorHandlerMiddleware.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

// Render sits behind a proxy. Trust its first proxy so rate limiting uses the
// requesting client's IP address instead of the proxy's address.
app.set("trust proxy", 1);

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header (for example health checks and curl)
    // are safe to allow; browser requests must come from an approved frontend.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
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
