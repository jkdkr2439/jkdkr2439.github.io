export function createLocaleService(initial = 'vi', supported = ['vi', 'en'], persistence = null) {
  const allowed = new Set(supported);
  let persisted = null;
  try { persisted = persistence?.read(); } catch {}
  let current = allowed.has(persisted) ? persisted : (allowed.has(initial) ? initial : supported[0]);
  const subscribers = new Set();
  return Object.freeze({
    get: () => current,
    set(next) {
      if (!allowed.has(next) || next === current) return allowed.has(next);
      current = next;
      try { persistence?.write(current); } catch {}
      for (const subscriber of subscribers) subscriber(current);
      return true;
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      subscriber(current);
      return () => subscribers.delete(subscriber);
    },
  });
}
