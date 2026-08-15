import { validateBooks } from './contracts.mjs';

export function createBooksController({load, view, locale, emit}) {
  let model = null;
  let unsubscribe = null;
  return {
    async mount() {
      try {
        const result = validateBooks(await load());
        if (!result.ok) {
          view.showFailure(result.code);
          emit('load-books', 'rejected', result.code);
          return;
        }
        model = result.value;
        unsubscribe = locale.subscribe(language => view.render(model, language));
        emit('load-books', 'accepted');
      } catch {
        view.showFailure('BOOKS_UNAVAILABLE');
        emit('load-books', 'rejected', 'BOOKS_UNAVAILABLE');
      }
    },
    unmount() { unsubscribe?.(); unsubscribe = null; model = null; view.clear(); }
  };
}
