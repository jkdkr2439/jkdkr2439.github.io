/**
 * Persistence adapter — localStorage implementation.
 * Ready to swap for SQLite or other backing store.
 */

const PREFIX = "relay.";

export function loadJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    /* persistence is optional — storage quota or private browsing */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    /* silent */
  }
}

export function loadFilters() {
  const value = loadJSON("filters");
  return value && typeof value === "object"
    ? {
        search: String(value.search || ""),
        severity: value.severity || "all",
        owner: value.owner || "all",
        status: value.status || "active",
      }
    : defaultFilters();
}

export function saveFilters(filters) {
  saveJSON("filters", filters);
}

export function defaultFilters() {
  return { search: "", severity: "all", owner: "all", status: "active" };
}
