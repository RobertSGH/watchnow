import bcrypt from "bcryptjs";
import { getUserByUsername, createUser } from "./database.js";

export async function hashPin(pin) {
  const saltRounds = 10;
  return await bcrypt.hash(pin, saltRounds);
}

export async function verifyPin(pin, hashedPin) {
  return await bcrypt.compare(pin, hashedPin);
}

export async function generateToken(fastify, user) {
  return fastify.jwt.sign({
    id: user.id,
    username: user.username,
  });
}

export async function verifyToken(fastify, token) {
  try {
    return fastify.jwt.verify(token);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function authenticateUser(username, pin) {
  const user = await getUserByUsername(username);

  if (!user) {
    throw new Error("User not found");
  }

  const isValidPin = await verifyPin(pin, user.pin_hash);

  if (!isValidPin) {
    throw new Error("Invalid PIN");
  }

  return {
    id: user.id,
    username: user.username,
  };
}

export async function registerUser(username, pin) {
  const pinHash = await hashPin(pin);
  const user = await createUser(username, pinHash);

  return {
    id: user.id,
    username: user.username,
  };
}
