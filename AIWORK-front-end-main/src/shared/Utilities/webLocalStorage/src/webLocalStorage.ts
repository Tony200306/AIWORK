import { nth } from 'ramda';

let checked = false;

/**
 * Checks if webLocalStorage is available in the current environment.
 * @returns {boolean} True if webLocalStorage is available, false otherwise.
 */
const storageAvailable = (): boolean => {
  if (!checked) {
    checked = true;
    const item = '@localStorageCheck';
    try {
      window.localStorage.setItem(item, item);
      window.localStorage.removeItem(item);
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

const memoryStorage = new Map<string, string>();

/**
 * Implements an in-memory storage similar to the Storage interface.
 * @returns {Storage} A Storage-like object.
 */
const createWebStorage = (): Storage => {
  if (storageAvailable()) {
    return window.localStorage;
  } else {
    return {
      getItem: (key): string | null => {
        return memoryStorage.get(key) ?? null;
      },
      setItem: (key, value): void => {
        memoryStorage.set(key, value);
      },
      removeItem: (key): void => {
        memoryStorage.delete(key);
      },
      clear: (): void => {
        memoryStorage.clear();
      },
      key: (index): string | null => {
        const key_ = nth(index, Array.from(memoryStorage.keys()));
        return key_ ? memoryStorage.get(key_) ?? null : null;
      },
      length: 0,
    };
  }
};

/**
 * A Storage-like object that either uses native localStorage or falls back to an in-memory solution.
 * @type {Storage}
 */
export const webLocalStorage = createWebStorage();
