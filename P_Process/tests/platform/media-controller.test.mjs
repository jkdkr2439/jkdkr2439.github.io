import test from 'node:test';
import assert from 'node:assert/strict';
import { createMediaController } from '../../platform/media/controller.mjs';

const valid = {
  heading:{vi:'Danh sách nghe',en:'Listening list'},
  description:{vi:'Chọn một tuyển tập.',en:'Choose a collection.'},
  channel:{url:'https://www.youtube.com/@danhnghiahe',label:{vi:'Mở kênh',en:'Open channel'}},
  playlists:[{id:'playlist-01',url:'https://www.youtube.com/watch?v=one',thumbnail:'D_Data/media/assets/images/youtube-playlists/playlist-01.jpg',name:{vi:'Một',en:'One'}}],
};

test('loads Media once and reuses it across disclosure toggles', async () => {
  let loads = 0;
  const renders = [], expanded = [];
  const locale = {get:()=> 'vi', subscribe(fn){this.listener=fn; return ()=>{};}};
  const controller = createMediaController({
    load:async()=>{loads++; return valid},
    view:{render:(model,language)=>renders.push([model.playlists.length,language]),setExpanded:value=>expanded.push(value),showFailure(){}},
    locale,
    emit(){}
  });
  await controller.toggle();
  await controller.toggle();
  await controller.toggle();
  locale.listener('en');
  assert.equal(loads, 1);
  assert.deepEqual(expanded, [true,false,true]);
  assert.deepEqual(renders, [[1,'vi'],[1,'en']]);
});

test('contains invalid Media data inside its own view', async () => {
  const failures = [], events = [];
  const controller = createMediaController({
    load:async()=>({...valid, playlists:[{...valid.playlists[0],url:'http://unsafe.test'}]}),
    view:{render(){},setExpanded(){},showFailure:code=>failures.push(code)},
    locale:{get:()=> 'vi',subscribe:()=>()=>{}},
    emit:(action,result,code)=>events.push({action,result,code}),
  });
  await controller.open();
  assert.equal(controller.isOpen(), false);
  assert.deepEqual(failures, ['MEDIA_DATA_INVALID']);
  assert.deepEqual(events.at(-1), {action:'load-media',result:'rejected',code:'INVALID_MEDIA_URL'});
});
