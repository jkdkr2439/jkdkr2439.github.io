export function mount({manifest,slot,navigate,emit,locale,activate}) {
  const link=document.createElement(activate?'button':'a'); link.className='destination';
  if(activate){link.type='button';link.setAttribute('aria-controls','media-panel');link.setAttribute('aria-expanded','false')}else{link.href=manifest.state==='active'?manifest.route:`#${manifest.id}`}
  link.dataset.moduleId=manifest.id; link.dataset.state=manifest.state;
  const index=document.createElement('span'); index.className='destination-index'; index.textContent=String(slot.children.length+1).padStart(2,'0');
  const copy=document.createElement('span'); copy.className='destination-copy'; const label=document.createElement('strong'), purpose=document.createElement('span'); copy.append(label,purpose); const state=document.createElement('span'); state.className='destination-state'; link.append(index,copy,state);
  let expanded=false;
  if(activate)link.addEventListener('click',async()=>{expanded=await activate(manifest,link);link.setAttribute('aria-expanded',String(expanded));state.textContent=expanded?(locale.get()==='vi'?'Đóng':'Close'):(locale.get()==='vi'?'Mở':'Open')});
  else if(manifest.state==='active')link.addEventListener('click',event=>{event.preventDefault();navigate(manifest.route)});
  locale.subscribe(value=>{label.textContent=manifest.labels[value];purpose.textContent=manifest.purpose[value];state.textContent=manifest.state==='active'?(expanded?(value==='vi'?'Đóng':'Close'):(value==='vi'?'Mở':'Open')):(value==='vi'?'Đang dựng':'Building')}); slot.append(link); emit('project-module','accepted');
}
