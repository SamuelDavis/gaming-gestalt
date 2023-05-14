import type { Writable } from "svelte/types/runtime/store";

export function persistent<T = any>(key: string, store: Writable<T>) {
  const local = localStorage.getItem(key);
  if (local !== null) store.set(JSON.parse(local));
  store.subscribe((value) => localStorage.setItem(key, JSON.stringify(value)));
  return store;
}
