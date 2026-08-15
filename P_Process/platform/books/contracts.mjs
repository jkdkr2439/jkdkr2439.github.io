const text = value => typeof value === 'string' && value.trim().length > 0;
const localized = value => text(value?.vi) && text(value?.en);
const cover = value => text(value) && /^D_Data\/media\/assets\/images\/books\/[a-z0-9-]+\.webp$/.test(value) && !value.includes('..');

export function validateBooks(source) {
  if (source?.version !== 1 || !localized(source?.heading) || !localized(source?.label) || !Array.isArray(source?.books)) {
    return {ok: false, code: 'INVALID_BOOK_CATALOG'};
  }
  const ids = new Set();
  for (const book of source.books) {
    if (!text(book?.id) || ids.has(book.id) || !localized(book.title) || !localized(book.summary) ||
        !localized(book.price_label) || !Number.isInteger(book.price) || book.price <= 0 || !cover(book.cover)) {
      return {ok: false, code: 'INVALID_BOOK_ENTRY'};
    }
    ids.add(book.id);
  }
  if (source.books.length !== 6) return {ok: false, code: 'INVALID_BOOK_COUNT'};
  return {ok: true, value: structuredClone(source)};
}
