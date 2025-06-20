import { useState, useEffect } from "react";
import {
  apiService,
  type Movie,
  type CreateMovieRequest,
} from "../services/api";

interface DashboardProps {
  user: { id: number; username: string };
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMovie, setNewMovie] = useState<CreateMovieRequest>({
    title: "",
    description: "",
    posterUrl: "",
    releaseDate: "",
    rating: undefined,
  });

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.getMovies();
      if (response.success && response.data) {
        setMovies(response.data.movies);
      } else {
        setError(response.error || "Failed to load movies");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMovie.title.trim()) {
      setError("Movie title is required");
      return;
    }

    try {
      const response = await apiService.addMovie(newMovie);
      if (response.success && response.data) {
        setMovies([response.data.movie, ...movies]);
        setNewMovie({
          title: "",
          description: "",
          posterUrl: "",
          releaseDate: "",
          rating: undefined,
        });
        setShowAddForm(false);
        setError("");
      } else {
        setError(response.error || "Failed to add movie");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleToggleWatched = async (
    movieId: number,
    currentWatched: boolean
  ) => {
    try {
      const response = await apiService.updateMovieStatus(
        movieId,
        !currentWatched
      );
      if (response.success) {
        setMovies(
          movies.map((movie) =>
            movie.id === movieId
              ? { ...movie, watched: !currentWatched }
              : movie
          )
        );
      } else {
        setError(response.error || "Failed to update movie status");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      const response = await apiService.deleteMovie(movieId);
      if (response.success) {
        setMovies(movies.filter((movie) => movie.id !== movieId));
      } else {
        setError(response.error || "Failed to delete movie");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleLogout = () => {
    apiService.clearToken();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                WatchNow
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome, {user.username}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Movie Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Watchlist
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showAddForm ? "Cancel" : "Add Movie"}
          </button>
        </div>

        {/* Add Movie Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add New Movie
            </h3>
            <form onSubmit={handleAddMovie} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newMovie.title}
                    onChange={(e) =>
                      setNewMovie({ ...newMovie, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={newMovie.releaseDate}
                    onChange={(e) =>
                      setNewMovie({ ...newMovie, releaseDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Poster URL
                  </label>
                  <input
                    type="url"
                    value={newMovie.posterUrl}
                    onChange={(e) =>
                      setNewMovie({ ...newMovie, posterUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rating (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={newMovie.rating || ""}
                    onChange={(e) =>
                      setNewMovie({
                        ...newMovie,
                        rating: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newMovie.description}
                  onChange={(e) =>
                    setNewMovie({ ...newMovie, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Movie
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Movies List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Loading movies...
            </p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No movies in your watchlist yet. Add your first movie!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {movie.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>

                  {movie.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {movie.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {movie.releaseDate && (
                      <span>{new Date(movie.releaseDate).getFullYear()}</span>
                    )}
                    {movie.rating && <span>⭐ {movie.rating}/10</span>}
                  </div>

                  <button
                    onClick={() => handleToggleWatched(movie.id, movie.watched)}
                    className={`w-full px-3 py-2 rounded-md text-sm font-medium ${
                      movie.watched
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {movie.watched ? "✓ Watched" : "Mark as Watched"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
