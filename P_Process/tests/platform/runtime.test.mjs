import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntime } from '../../platform/runtime.mjs';

const module = id => ({id, version:'1', state:'active', route:`/${id}/`, slot:'destinations', labels:{vi:id,en:id}, purpose:{vi:id,en:id}, entry:'destination', builder:'placeholder', health_contract:'v1', dependencies:[], capabilities:[]});
const shell = () => ({mounted:[], failures:[], slot:()=>({}), showFailure(code){this.failures.push(code)}, setStatus(){}});

test('a throwing module cannot prevent the next valid module from mounting', async () => {
  const view = shell();
  const locale = {get:()=> 'vi'};
  const report = await createRuntime({
    loadRegistry: async()=>({version:1,modules:[module('broken'),module('writing')]}),
    loadModule: async item => item.id === 'broken' ? {mount(){throw new Error('private')}} : {mount(){view.mounted.push(item.id)}},
    shell:view, identity:{}, locale, clock:()=> 'fixed'
  }).boot();
  assert.deepEqual(view.mounted, ['writing']);
  assert.deepEqual(view.failures, ['MODULE_MOUNT_FAILED']);
  assert.equal(JSON.stringify(report).includes('private'), false);
  assert.equal(report.events.at(-1).phase, 'O_Output');
});
