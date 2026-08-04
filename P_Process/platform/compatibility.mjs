export function resolveLegacyLocation(value) {
  const url = new URL(value);
  if (url.pathname !== '/' || url.search.length > 512) return null;
  const query = new URLSearchParams(url.search);
  if (!query.has('post') && !query.has('book')) return null;
  return `/writing/${url.search}`;
}
