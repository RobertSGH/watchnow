# WatchNow Backend

A Fastify-based backend API for the WatchNow movie tracking application with JWT authentication and SQLite database.

## Features

- 🔐 JWT-based authentication
- 👤 User registration and login with PIN
- 🎬 Movie watchlist management
- 💾 SQLite database for data persistence
- 🛡️ CORS enabled for frontend integration
- 📝 Input validation with JSON Schema

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment configuration:**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   DB_PATH=./data/watchnow.db
   PORT=3001
   NODE_ENV=development
   ```

3. **Start the server:**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

#### POST `/api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "username": "john_doe",
  "pin": "1234"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

#### POST `/api/auth/login`

Login with existing credentials.

**Request Body:**

```json
{
  "username": "john_doe",
  "pin": "1234"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

#### GET `/api/auth/verify`

Verify JWT token (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

### Movies

All movie endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

#### GET `/api/movies`

Get all movies for the authenticated user.

**Response:**

```json
{
  "success": true,
  "movies": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Inception",
      "description": "A thief who steals corporate secrets...",
      "poster_url": "https://example.com/poster.jpg",
      "release_date": "2010-07-16",
      "rating": 8.8,
      "watched": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/movies`

Add a new movie to the user's watchlist.

**Request Body:**

```json
{
  "title": "Inception",
  "description": "A thief who steals corporate secrets...",
  "posterUrl": "https://example.com/poster.jpg",
  "releaseDate": "2010-07-16",
  "rating": 8.8
}
```

**Response:**

```json
{
  "success": true,
  "movie": {
    "id": 1,
    "title": "Inception",
    "description": "A thief who steals corporate secrets...",
    "posterUrl": "https://example.com/poster.jpg",
    "releaseDate": "2010-07-16",
    "rating": 8.8
  }
}
```

#### PATCH `/api/movies/:id/watched`

Update the watched status of a movie.

**Request Body:**

```json
{
  "watched": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Movie marked as watched"
}
```

#### DELETE `/api/movies/:id`

Delete a movie from the user's watchlist.

**Response:**

```json
{
  "success": true,
  "message": "Movie deleted successfully"
}
```

## Database Schema

### Users Table

- `id` (INTEGER, PRIMARY KEY)
- `username` (TEXT, UNIQUE, NOT NULL)
- `pin_hash` (TEXT, NOT NULL)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Movies Table

- `id` (INTEGER, PRIMARY KEY)
- `user_id` (INTEGER, NOT NULL, FOREIGN KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `poster_url` (TEXT)
- `release_date` (TEXT)
- `rating` (REAL)
- `watched` (BOOLEAN, DEFAULT FALSE)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

## Security Features

- PINs are hashed using bcrypt with salt rounds of 10
- JWT tokens for stateless authentication
- Input validation using JSON Schema
- CORS protection
- SQL injection prevention through parameterized queries

## Development

The server runs in development mode with auto-restart when files change. The database file will be created automatically in the `data/` directory.

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong, unique `JWT_SECRET`
3. Configure proper CORS origins
4. Consider using a production database like PostgreSQL
5. Set up proper logging and monitoring
