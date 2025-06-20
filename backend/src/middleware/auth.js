import { verifyToken } from "../auth.js";

export async function authenticate(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(request.server, token);

    request.user = decoded;
  } catch (error) {
    reply.code(401).send({
      success: false,
      error: "Authentication failed",
    });
  }
}
