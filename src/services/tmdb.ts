/* Servicio ligero para consumir la API de TMDB
   - Preferencia: leer token desde `import.meta.env.VITE_TMDB_TOKEN`
   - Fallback: token embebido (solo para desarrollo temporal)
*/

type Params = Record<string, string | number | boolean>;

const DEFAULT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjYTg0NjYzYmI1MjJhMTVjZTdmZjhlOTQ5ZTNkM2Y4ZCIsIm5iZiI6MTc2ODE1NzY0My4xNDgsInN1YiI6IjY5NjNmMWNiNWE0YjcwMTA2NDkzNDM5YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.eBUwVYOeIhlwzzxzbYdQHSZpVdYOt5wo_3Py_1xmssQ';

class TmdbService {
  private base = 'https://api.themoviedb.org/3';
  private token: string;

  constructor(token?: string) {
    this.token = token ?? (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_TMDB_TOKEN : undefined) ?? DEFAULT_TOKEN;
  }

  private headers() {
    if (!this.token) throw new Error('TMDB token not configured');
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json;charset=utf-8',
    } as Record<string, string>;
  }

  private buildUrl(path: string, params?: Params) {
    const url = new URL(this.base + path);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
    }
    return url.toString();
  }

  private async request<T = any>(path: string, params?: Params): Promise<T> {
    const url = this.buildUrl(path, params);
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TMDB ${res.status} ${res.statusText}: ${text}`);
    }
    return (await res.json()) as T;
  }

  // Endpoints comunes
  getPopular(page = 1) {
    return this.request<{ page: number; results: any[] }>(`/movie/popular`, { page });
  }

  getTopRated(page = 1) {
    return this.request<{ page: number; results: any[] }>(`/movie/top_rated`, { page });
  }

  searchMovies(query: string, page = 1) {
    return this.request<{ page: number; results: any[] }>(`/search/movie`, { query, page, include_adult: false });
  }

  getMovieDetails(id: number | string) {
    return this.request(`/movie/${id}`, { append_to_response: 'videos,credits,recommendations,images' });
  }

  getMovieCredits(id: number | string) {
    return this.request(`/movie/${id}/credits`);
  }

  getMovieVideos(id: number | string) {
    return this.request(`/movie/${id}/videos`);
  }

  // Trending: media_type can be 'movie'|'all'|'tv', timeWindow 'day'|'week'
  getTrending(media_type: 'movie' | 'all' | 'tv' = 'movie', timeWindow: 'day' | 'week' = 'week') {
    return this.request<{ page?: number; results: any[] }>(`/trending/${media_type}/${timeWindow}`);
  }

  // Upcoming movies
  getUpcoming(page = 1) {
    return this.request<{ page: number; results: any[] }>(`/movie/upcoming`, { page });
  }

  // Helper para construir URLs de imagen
  imageUrl(path: string | null | undefined, size = 'w500') {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

const tmdb = new TmdbService();
export default tmdb;
