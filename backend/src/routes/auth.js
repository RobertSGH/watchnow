import { authenticateUser, registerUser, generateToken } from "../auth.js";

export default async function authRoutes(fastify, options) {
  // Login route
  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "pin"],
          properties: {
            username: { type: "string", minLength: 1 },
            pin: { type: "string", minLength: 4, maxLength: 4 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { username, pin } = request.body;

        const user = await authenticateUser(username, pin);
        const token = await generateToken(fastify, user);

        reply.send({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
          },
        });
      } catch (error) {
        reply.code(401).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // Register route
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "pin"],
          properties: {
            username: { type: "string", minLength: 1 },
            pin: { type: "string", minLength: 4, maxLength: 4 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { username, pin } = request.body;

        const user = await registerUser(username, pin);
        const token = await generateToken(fastify, user);

        reply.code(201).send({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
          },
        });
      } catch (error) {
        reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // Verify token route
  fastify.get(
    "/verify",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      reply.send({
        success: true,
        user: request.user,
      });
    }
  );
}
