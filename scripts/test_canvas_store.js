const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const storage = new Map([['canvas.contextCollapsed', 'true']]);
const context = {
  URLSearchParams,
  location: {search: ''},
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  },
  window: {
    DNHCanvasRegistry: {defaultDomain: 'first', domainKeys: ['first', 'second']},
    DNHCanvasContracts: {
      acceptsDomain: key => ['first', 'second'].includes(key),
      language: value => value === 'en' ? 'en' : 'vi'
    }
  }
};

vm.runInNewContext(
  fs.readFileSync('D_Display/assets/js/canvas/store.js', 'utf8'),
  context
);
const store = context.window.DNHCanvasStore;

assert.equal(store.getState().contextCollapsed, true, 'precondition: context starts collapsed');
store.setDomain('second');
assert.equal(store.getState().domain, 'second');
assert.equal(store.getState().contextCollapsed, false, 'selecting a domain must reveal its context');
assert.equal(storage.get('canvas.contextCollapsed'), 'false', 'expanded state must persist');

console.log('CANVAS STORE: PASS');
