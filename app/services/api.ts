const API_BASE_URL = "http://localhost:3001/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

interface Movie {
  id: number;
  title: string;
  description?: string;
  posterUrl?: string;
  releaseDate?: string;
  rating?: number;
  watched: boolean;
  createdAt: string;
}

interface CreateMovieRequest {
  title: string;
  description?: string;
  posterUrl?: string;
  releaseDate?: string;
  rating?: number;
}

// Helper function to safely access localStorage
const getLocalStorage = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorage = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    setLocalStorage("authToken", token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = getLocalStorage("authToken");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    removeLocalStorage("authToken");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Authentication methods
  async register(
    username: string,
    pin: string
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, pin }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(
    username: string,
    pin: string
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, pin }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async verifyToken(): Promise<
    ApiResponse<{ user: { id: number; username: string } }>
  > {
    return this.request<{ user: { id: number; username: string } }>(
      "/auth/verify"
    );
  }

  // Movie methods
  async getMovies(): Promise<ApiResponse<{ movies: Movie[] }>> {
    return this.request<{ movies: Movie[] }>("/movies");
  }

  async addMovie(
    movieData: CreateMovieRequest
  ): Promise<ApiResponse<{ movie: Movie }>> {
    return this.request<{ movie: Movie }>("/movies", {
      method: "POST",
      body: JSON.stringify(movieData),
    });
  }

  async updateMovieStatus(
    movieId: number,
    watched: boolean
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/movies/${movieId}/watched`, {
      method: "PATCH",
      body: JSON.stringify({ watched }),
    });
  }

  async deleteMovie(
    movieId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/movies/${movieId}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
export type { Movie, CreateMovieRequest, AuthResponse };
