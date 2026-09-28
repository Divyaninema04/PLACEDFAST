import express from "express";
import cors from "cors";
import { config, validateEnv } from "./config/env.js";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

validateEnv();

const app = express();

// Middlewares
app.use(
  cors({
    origin: [config.corsOrigin, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Root health & info
app.get("/", (_req, res) => {
  res.json({
    name: "PlacementPilot Backend API",
    version: "1.0.0",
    status: "online",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      user: "/api/user",
      companies: "/api/companies",
      applications: "/api/applications",
      academics: "/api/academics",
      resumes: "/api/resumes",
      mentor: "/api/mentor/chat",
      roadmap: "/api/roadmap",
      opportunities: "/api/opportunities",
    },
  });
});

// API Routes
app.use("/api", apiRoutes);

// Central error handler
app.use(errorHandler);

// Start server
async function startServer() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`========================================`);
    console.log(` PlacementPilot Backend Server Running`);
    console.log(` Port: ${config.port}`);
    console.log(` URL:  http://localhost:${config.port}`);
    console.log(` CORS: ${config.corsOrigin}`);
    console.log(`========================================`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[Server Notice] Port ${config.port} is already in use by an existing process.`);
      console.warn(`[Server Notice] If you have 'npm run dev' already running, it is serving the backend.`);
    } else {
      console.error("[Server Error]", err);
    }
  });
}

startServer();

export default app;
