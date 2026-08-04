import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocaleService } from '../../platform/locale.mjs';

test('one locale change reaches every module subscriber', () => {
  const service = createLocaleService('vi', ['vi', 'en']);
  const writing = [];
  const media = [];
  service.subscribe(value => writing.push(value));
  service.subscribe(value => media.push(value));
  assert.equal(service.set('en'), true);
  assert.deepEqual(writing, ['vi', 'en']);
  assert.deepEqual(media, ['vi', 'en']);
});

test('unsupported locale is rejected without changing state', () => {
  const service = createLocaleService('vi', ['vi', 'en']);
  assert.equal(service.set('fr'), false);
  assert.equal(service.get(), 'vi');
});

test('shared persistence lets child modules inherit the canvas locale', () => {
  let stored = 'en';
  const persistence = {read:()=>stored, write:value=>{stored=value}};
  const service = createLocaleService('vi', ['vi', 'en'], persistence);
  assert.equal(service.get(), 'en');
  service.set('vi');
  assert.equal(stored, 'vi');
});
