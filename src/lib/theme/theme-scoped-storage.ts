import type { StateStorage } from "zustand/middleware";

const LEGACY_STORAGE_KEY = "premium-audit-theme-store";

let scopeId = "anon";

/**
 * Namespaces persisted theme state per signed-in user so switching accounts
 * does not overwrite another account's local preferences.
 */
export const setThemePersistScope = (userId: string | null) => {
  scopeId = userId?.trim() ? userId.trim() : "anon";
};

export const getThemePersistScope = () => scopeId;

function scopedStorageKey() {
  return `${LEGACY_STORAGE_KEY}:${scopeId}`;
}

export const themeScopedStorage: StateStorage = {
  getItem: () => {
    if (typeof window === "undefined") {
      return null;
    }

    const key = scopedStorageKey();
    const scoped = localStorage.getItem(key);

    if (scoped) {
      return scoped;
    }

    if (scopeId === "anon") {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);

      if (legacy) {
        localStorage.setItem(key, legacy);

        return legacy;
      }
    }

    return null;
  },
  setItem: (_name, value) => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(scopedStorageKey(), value);
  },
  removeItem: () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(scopedStorageKey());
  },
};
