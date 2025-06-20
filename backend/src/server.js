import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";
import { initializeDatabase } from "./database.js";
import { authenticate } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(cors, {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://yourdomain.com"]
      : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || "fallback-secret-key",
});

// Register authentication middleware
fastify.decorate("authenticate", authenticate);

// Register routes
await fastify.register(authRoutes, { prefix: "/api/auth" });
await fastify.register(movieRoutes, { prefix: "/api/movies" });

// Health check route
fastify.get("/health", async (request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Root route
fastify.get("/", async (request, reply) => {
  return {
    message: "WatchNow API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      movies: "/api/movies",
    },
  };
});

// Start server
const start = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log("📚 API Documentation:");
    console.log("  - POST /api/auth/register - Register new user");
    console.log("  - POST /api/auth/login - Login user");
    console.log("  - GET /api/auth/verify - Verify token");
    console.log("  - GET /api/movies - Get user movies");
    console.log("  - POST /api/movies - Add new movie");
    console.log("  - PATCH /api/movies/:id/watched - Update movie status");
    console.log("  - DELETE /api/movies/:id - Delete movie");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
