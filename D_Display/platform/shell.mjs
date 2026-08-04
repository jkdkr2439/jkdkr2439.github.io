const node = (tag,cls,value='') => { const item=document.createElement(tag); item.className=cls; item.textContent=value; return item; };
export function createShell(root,identity,locale) {
  root.replaceChildren(); const page=node('div','site-ground'); const header=node('header','identity');
  const eyebrow=node('p','eyebrow'), name=node('h1','name',identity.name), statement=node('p','statement');
  const language=node('div','language-switch'); language.setAttribute('role','group'); language.setAttribute('aria-label','Language');
  const vi=node('button','language-option','VI'), en=node('button','language-option','EN'); vi.type=en.type='button'; vi.onclick=()=>locale.set('vi'); en.onclick=()=>locale.set('en'); language.append(vi,en); header.append(eyebrow,name,statement,language);
  const main=node('main',''); const destinations=node('nav','destinations'); destinations.setAttribute('aria-label','Destinations');
  const connect=node('section','connect-frame'); connect.id='connect'; connect.setAttribute('aria-live','polite');
  const media=node('section','media-panel'); media.id='media'; media.setAttribute('aria-live','polite'); main.append(destinations,connect,media);
  const footer=node('footer',''); const status=node('p','runtime-status'); status.setAttribute('role','status'); footer.append(status); page.append(header,main,footer); root.append(page);
  let count=null; const renderStatus=value=>status.textContent=count?(value==='vi'?`${count.mounted}/${count.total} module đã gắn`:`${count.mounted}/${count.total} modules mounted`):(value==='vi'?'Đang đọc các module…':'Reading modules…');
  locale.subscribe(value=>{ document.documentElement.lang=value; eyebrow.textContent=identity.eyebrow[value]; statement.textContent=identity.statement[value]; vi.setAttribute('aria-pressed',String(value==='vi')); en.setAttribute('aria-pressed',String(value==='en')); renderStatus(value); });
  return {slot:name=>{if(name==='destinations')return destinations;if(name==='connect')return connect;if(name==='media')return media;throw new Error('UNKNOWN_SLOT')},showFailure:(code,id)=>footer.append(node('p','module-failure',`${id}: ${code}`)),setStatus:value=>{count=value;renderStatus(locale.get())},navigate:route=>window.location.assign(route)};
}
