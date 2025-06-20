import {
  addMovie,
  getMoviesByUserId,
  updateMovieStatus,
  deleteMovie,
} from "../database.js";

export default async function movieRoutes(fastify, options) {
  // Get all movies for user
  fastify.get(
    "/",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      try {
        const movies = await getMoviesByUserId(request.user.id);
        reply.send({
          success: true,
          movies,
        });
      } catch (error) {
        reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // Add new movie
  fastify.post(
    "/",
    {
      preHandler: fastify.authenticate,
      schema: {
        body: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", minLength: 1 },
            description: { type: "string" },
            posterUrl: { type: "string" },
            releaseDate: { type: "string" },
            rating: { type: "number", minimum: 0, maximum: 10 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const movieData = {
          title: request.body.title,
          description: request.body.description || "",
          posterUrl: request.body.posterUrl || "",
          releaseDate: request.body.releaseDate || "",
          rating: request.body.rating || null,
        };

        const movie = await addMovie(request.user.id, movieData);

        reply.code(201).send({
          success: true,
          movie,
        });
      } catch (error) {
        reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // Update movie watched status
  fastify.patch(
    "/:id/watched",
    {
      preHandler: fastify.authenticate,
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["watched"],
          properties: {
            watched: { type: "boolean" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { watched } = request.body;

        await updateMovieStatus(parseInt(id), request.user.id, watched);

        reply.send({
          success: true,
          message: `Movie ${
            watched ? "marked as watched" : "marked as unwatched"
          }`,
        });
      } catch (error) {
        reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // Delete movie
  fastify.delete(
    "/:id",
    {
      preHandler: fastify.authenticate,
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        await deleteMovie(parseInt(id), request.user.id);

        reply.send({
          success: true,
          message: "Movie deleted successfully",
        });
      } catch (error) {
        reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    }
  );
}
