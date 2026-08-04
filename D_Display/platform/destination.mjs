export function mount({manifest,slot,navigate,emit,locale}) {
  const link=document.createElement('a'); link.className='destination'; link.href=manifest.state==='active'?manifest.route:`#${manifest.id}`; link.dataset.moduleId=manifest.id; link.dataset.state=manifest.state;
  const index=document.createElement('span'); index.className='destination-index'; index.textContent=String(slot.children.length+1).padStart(2,'0');
  const copy=document.createElement('span'); copy.className='destination-copy'; const label=document.createElement('strong'), purpose=document.createElement('span'); copy.append(label,purpose); const state=document.createElement('span'); state.className='destination-state'; link.append(index,copy,state);
  if(manifest.state==='active')link.addEventListener('click',event=>{event.preventDefault();navigate(manifest.route)});
  locale.subscribe(value=>{label.textContent=manifest.labels[value];purpose.textContent=manifest.purpose[value];state.textContent=manifest.state==='active'?(value==='vi'?'Mở':'Open'):(value==='vi'?'Đang dựng':'Building')}); slot.append(link); emit('project-module','accepted');
}
