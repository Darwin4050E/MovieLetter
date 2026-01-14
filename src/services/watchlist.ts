export interface WatchItem {
  id: number | string; // tmdb id
  title: string;
  poster_path?: string | null;
  addedAt: string;
}

const KEY = 'watchlist_v1';

function readAll(): WatchItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading watchlist', e);
    return [];
  }
}

function writeAll(items: WatchItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getAll(): WatchItem[] {
  return readAll();
}

export function contains(id: string | number) {
  const all = readAll();
  return all.some((i) => String(i.id) === String(id));
}

export function add(item: Omit<WatchItem, 'addedAt'>) {
  const all = readAll();
  if (all.some((i) => String(i.id) === String(item.id))) return;
  const toAdd: WatchItem = { ...item, addedAt: new Date().toISOString() } as WatchItem;
  all.push(toAdd);
  writeAll(all);
}

export function remove(id: string | number) {
  const all = readAll();
  const next = all.filter((i) => String(i.id) !== String(id));
  writeAll(next);
}

export function clear() {
  writeAll([]);
}
