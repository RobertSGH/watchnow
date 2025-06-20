import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function initializeDatabase() {
  // Ensure the data directory exists
  const dbPath = process.env.DB_PATH || "./data/watchnow.db";
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      pin_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create movies table for watchlist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      poster_url TEXT,
      release_date TEXT,
      rating REAL,
      watched BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log("Database initialized successfully");
  return db;
}

export async function createUser(username, pinHash) {
  try {
    const result = await db.run(
      "INSERT INTO users (username, pin_hash) VALUES (?, ?)",
      [username, pinHash]
    );
    return { id: result.lastID, username };
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new Error("Username already exists");
    }
    throw error;
  }
}

export async function getUserByUsername(username) {
  return await db.get("SELECT * FROM users WHERE username = ?", [username]);
}

export async function getUserById(id) {
  return await db.get(
    "SELECT id, username, created_at FROM users WHERE id = ?",
    [id]
  );
}

export async function addMovie(userId, movieData) {
  const result = await db.run(
    "INSERT INTO movies (user_id, title, description, poster_url, release_date, rating) VALUES (?, ?, ?, ?, ?, ?)",
    [
      userId,
      movieData.title,
      movieData.description,
      movieData.posterUrl,
      movieData.releaseDate,
      movieData.rating,
    ]
  );
  return { id: result.lastID, ...movieData };
}

export async function getMoviesByUserId(userId) {
  return await db.all(
    "SELECT * FROM movies WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
}

export async function updateMovieStatus(movieId, userId, watched) {
  await db.run("UPDATE movies SET watched = ? WHERE id = ? AND user_id = ?", [
    watched,
    movieId,
    userId,
  ]);
}

export async function deleteMovie(movieId, userId) {
  await db.run("DELETE FROM movies WHERE id = ? AND user_id = ?", [
    movieId,
    userId,
  ]);
}

export { db };
