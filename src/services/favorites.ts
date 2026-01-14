export interface FavoriteItem {
  id: number | string;
  title: string;
  poster_path?: string | null;
  addedAt: string;
}

const KEY = 'favorites_v1';

function readAll(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading favorites', e);
    return [];
  }
}

function writeAll(items: FavoriteItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getAll(): FavoriteItem[] {
  return readAll();
}

export function contains(id: string | number) {
  const all = readAll();
  return all.some((i) => String(i.id) === String(id));
}

export function add(item: Omit<FavoriteItem, 'addedAt'>) {
  const all = readAll();
  if (all.some((i) => String(i.id) === String(item.id))) return;
  const toAdd: FavoriteItem = { ...item, addedAt: new Date().toISOString() } as FavoriteItem;
  all.unshift(toAdd);
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
