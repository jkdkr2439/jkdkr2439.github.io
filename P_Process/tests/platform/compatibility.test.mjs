import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLegacyLocation } from '../../platform/compatibility.mjs';

test('maps legacy post and book queries to Writing while preserving query bytes', () => {
  assert.equal(resolveLegacyLocation('https://example.test/?post=%2Ftieng-cho%2F'), '/writing/?post=%2Ftieng-cho%2F');
  assert.equal(resolveLegacyLocation('https://example.test/?book=jung&domain=translation'), '/writing/?book=jung&domain=translation');
});

test('ignores unrelated nested and oversized locations', () => {
  assert.equal(resolveLegacyLocation('https://example.test/?domain=writing'), null);
  assert.equal(resolveLegacyLocation('https://example.test/writing/?post=%2Fx%2F'), null);
  assert.equal(resolveLegacyLocation(`https://example.test/?post=${'x'.repeat(600)}`), null);
});
