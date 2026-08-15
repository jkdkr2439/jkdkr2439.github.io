import { loadJson } from './load_registry.mjs';

export const loadBooks = () => loadJson('/canvas/D_Data/platform/books/catalog.json');
