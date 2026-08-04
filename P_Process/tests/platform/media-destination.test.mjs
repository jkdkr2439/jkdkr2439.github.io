import test from 'node:test';
import assert from 'node:assert/strict';
import { mount } from '../../../D_Display/platform/destination.mjs';

class FakeNode extends EventTarget {
  constructor(tag) { super(); this.tagName=tag; this.children=[]; this.dataset={}; this.attributes={}; this.className=''; this.textContent=''; }
  append(...items) { this.children.push(...items); }
  setAttribute(name,value) { this.attributes[name]=String(value); }
  getAttribute(name) { return this.attributes[name]; }
}

test('Media destination toggles its inline panel without navigation', async () => {
  const previous = globalThis.document;
  globalThis.document = {createElement:tag=>new FakeNode(tag)};
  try {
    const slot=new FakeNode('nav'); let navigated=false; let activations=0;
    mount({
      manifest:{id:'media',state:'active',route:'/media/',labels:{vi:'Media',en:'Media'},purpose:{vi:'Nghe',en:'Listen'}},
      slot, navigate:()=>{navigated=true}, emit(){}, locale:{get:()=> 'vi',subscribe:fn=>fn('vi')},
      activate:async()=>{activations++; return activations % 2 === 1},
    });
    const control=slot.children[0];
    control.dispatchEvent(new Event('click',{cancelable:true}));
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(control.getAttribute('aria-controls'),'media-panel');
    assert.equal(control.getAttribute('aria-expanded'),'true');
    assert.equal(navigated,false);
  } finally { globalThis.document=previous; }
});
