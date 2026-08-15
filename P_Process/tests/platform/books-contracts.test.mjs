import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateBooks } from '../../platform/books/contracts.mjs';

test('accepts the canonical six-book rail catalog', async () => {
  const payload = JSON.parse(await readFile('D_Data/platform/books/catalog.json', 'utf8'));
  const result = validateBooks(payload);
  assert.equal(result.ok, true);
  assert.equal(result.value.books.length, 6);
  assert.deepEqual(result.value.books.map(book => book.price), [200000, 350000, 350000, 350000, 500000, 1000000]);
});

test('rejects duplicate ids, remote covers, and invalid prices', () => {
  const book = id => ({id,title:{vi:id,en:id},summary:{vi:'x',en:'x'},price:1,price_label:{vi:'1',en:'1'},cover:`D_Data/media/assets/images/books/${id}.webp`});
  const base = {version:1,label:{vi:'Sách',en:'Books'},heading:{vi:'Sáu',en:'Six'},books:[book('a'),book('b'),book('c'),book('d'),book('e'),book('f')]};
  assert.equal(validateBooks({...base,books:[book('a'),book('a'),book('c'),book('d'),book('e'),book('f')]}).ok, false);
  assert.equal(validateBooks({...base,books:[{...book('a'),cover:'https://example.com/a.webp'},...base.books.slice(1)]}).ok, false);
  assert.equal(validateBooks({...base,books:[{...book('a'),price:0},...base.books.slice(1)]}).ok, false);
});
