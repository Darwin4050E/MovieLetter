export interface Review {
  id: string;
  movieId: string;
  author?: string;
  text: string;
  rating: number;
  date: string;
  photoBase64?: string;
}

const ALL_KEY = 'reviews_all';

export function readAll(): Review[] {
  try {
    const raw = localStorage.getItem(ALL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading reviews', e);
    return [];
  }
}

export function getAll(): Review[] {
  return readAll();
}

function writeAll(items: Review[]) {
  localStorage.setItem(ALL_KEY, JSON.stringify(items));
}

export function getByMovie(movieId: string): Review[] {
  const all = readAll();
  return all.filter((r) => r.movieId === movieId);
}

export function getById(id: string): Review | undefined {
  const all = readAll();
  return all.find((r) => r.id === id);
}

export function saveReview(review: Omit<Review, 'id' | 'date'> & Partial<Pick<Review, 'id'>>): Review {
  const all = readAll();
  const now = new Date().toLocaleDateString();
  if (review.id) {
    // update
    const idx = all.findIndex((r) => r.id === review.id);
    if (idx !== -1) {
      const updated: Review = { ...all[idx], ...review, date: now } as Review;
      all[idx] = updated;
      writeAll(all);
      // Also sync per-movie key
      syncPerMovie(updated.movieId, all.filter((r) => r.movieId === updated.movieId));
      // notify
      window.dispatchEvent(new Event('app:reviews-updated'));
      return updated;
    }
  }

  // create
  const id = Date.now().toString();
  const newReview: Review = { ...review, id, date: now } as Review;
  all.push(newReview);
  writeAll(all);
  syncPerMovie(newReview.movieId, all.filter((r) => r.movieId === newReview.movieId));
  // notify
  window.dispatchEvent(new Event('app:reviews-updated'));
  return newReview;
}

function syncPerMovie(movieId: string, reviews: Review[]) {
  try {
    localStorage.setItem(`reviews_${movieId}`, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error syncing per-movie reviews', e);
  }
}

export function deleteReview(id: string) {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const movieId = all[idx].movieId;
  all.splice(idx, 1);
  writeAll(all);
  syncPerMovie(movieId, all.filter((r) => r.movieId === movieId));
  // notify
  window.dispatchEvent(new Event('app:reviews-updated'));
}
