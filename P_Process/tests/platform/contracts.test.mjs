import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateRegistry } from '../../platform/contracts.mjs';

test('accepts the canonical five-module platform registry', async () => {
  const registry = JSON.parse(await readFile('D_Data/platform/registry/modules.json', 'utf8'));
  const result = validateRegistry(registry);
  assert.deepEqual(result.accepted.map(({id}) => id), ['writing', 'products', 'papers', 'media', 'connect']);
  assert.deepEqual(result.accepted.map(({id,entry,slot}) => ({id,entry,slot})), [
    {id:'writing',entry:'destination',slot:'destinations'},
    {id:'products',entry:'destination',slot:'destinations'},
    {id:'papers',entry:'destination',slot:'destinations'},
    {id:'media',entry:'media',slot:'media'},
    {id:'connect',entry:'connect',slot:'connect'},
  ]);
  assert.deepEqual(result.rejected, []);
});

test('rejects duplicate ids and routes without mutating input', () => {
  const item = id => ({id, version:'1', state:'planned', route:`/${id}/`, slot:'destinations', labels:{vi:id,en:id}, purpose:{vi:id,en:id}, entry:'destination', builder:'placeholder', health_contract:'placeholder-v1', dependencies:[], capabilities:[]});
  const registry = {version:1, modules:[item('one'), {...item('one'), route:'/two/'}, item('one-route')]};
  registry.modules[2].route = '/one/';
  const before = structuredClone(registry);
  assert.deepEqual(validateRegistry(registry).rejected.map(({code}) => code), ['DUPLICATE_MODULE_ID', 'DUPLICATE_MODULE_ROUTE']);
  assert.deepEqual(registry, before);
});
