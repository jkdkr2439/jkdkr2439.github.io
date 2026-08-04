import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateConnect } from '../../platform/connect/contracts.mjs';

test('accepts the canonical three-link Connect frame', async () => {
  const payload=JSON.parse(await readFile('D_Data/platform/connect/links.json','utf8'));
  const result=validateConnect(payload);
  assert.equal(result.ok,true);
  assert.deepEqual(result.value.links.map(({id})=>id),['youtube','substack','facebook']);
  assert.equal(Object.isFrozen(result.value),true);
});

test('rejects unsafe links and incomplete bilingual copy', () => {
  const base={heading:{vi:'Kết nối',en:'Connect'},title:{vi:'Theo dõi',en:'Follow'},description:{vi:'Ba cửa.',en:'Three doors.'},links:[{id:'youtube',url:'https://www.youtube.com/@danhnghiahe',label:{vi:'YouTube',en:'YouTube'}}]};
  assert.equal(validateConnect({...base,links:[{...base.links[0],url:'http://unsafe.test'}]}).code,'INVALID_CONNECT_URL');
  assert.equal(validateConnect({...base,title:{vi:'Theo dõi'}}).code,'INVALID_CONNECT_COPY');
});
