import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooksController } from '../../platform/books/controller.mjs';

const catalog = {version:1,label:{vi:'Sách',en:'Books'},heading:{vi:'Sáu',en:'Six'},books:Array.from({length:6},(_,index)=>({id:`b${index}`,title:{vi:'Tên',en:'Title'},summary:{vi:'Tóm tắt',en:'Summary'},price:100,price_label:{vi:'100',en:'100'},cover:`D_Data/media/assets/images/books/b${index}.webp`}))};

test('renders accepted books and follows locale', async () => {
  const renders=[]; const events=[];
  const locale={subscribe(fn){fn('vi');fn('en');return()=>{}}};
  const view={render(model,language){renders.push([model.books.length,language])},showFailure(){},clear(){}};
  const controller=createBooksController({load:async()=>catalog,view,locale,emit:(...event)=>events.push(event)});
  await controller.mount();
  assert.deepEqual(renders,[[6,'vi'],[6,'en']]);
  assert.deepEqual(events.at(-1),['load-books','accepted']);
});

test('contains invalid catalog inside its own view', async () => {
  const failures=[]; const events=[];
  const view={render(){},showFailure(code){failures.push(code)},clear(){}};
  const controller=createBooksController({load:async()=>({}),view,locale:{subscribe(){}},emit:(...event)=>events.push(event)});
  await controller.mount();
  assert.deepEqual(failures,['INVALID_BOOK_CATALOG']);
  assert.deepEqual(events.at(-1),['load-books','rejected','INVALID_BOOK_CATALOG']);
});
