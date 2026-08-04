import {validateConnect} from '../../../P_Process/platform/connect/contracts.mjs';
const node=(tag,cls,value='')=>{const item=document.createElement(tag);item.className=cls;item.textContent=value;return item};
export async function mount({slot,locale,emit,load}){
  let result;
  try{result=validateConnect(await load())}catch{result={ok:false,code:'CONNECT_UNAVAILABLE'}}
  if(!result.ok){slot.replaceChildren(node('p','module-failure',result.code));emit('load-connect','rejected',result.code);return}
  const model=result.value,heading=node('span','connect-label'),title=node('h2','connect-title'),description=node('p','connect-description'),links=node('div','connect-links');
  for(const link of model.links){const anchor=node('a',`connect-link connect-${link.id}`,link.id==='youtube'?'▶':link.id==='substack'?'≡':'f');anchor.href=link.url;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.dataset.connectId=link.id;links.append(anchor)}
  slot.replaceChildren(heading,title,description,links);
  locale.subscribe(language=>{heading.textContent=model.heading[language];title.textContent=model.title[language];description.textContent=model.description[language];[...links.children].forEach((anchor,index)=>{anchor.setAttribute('aria-label',model.links[index].label[language]);anchor.title=model.links[index].label[language]})});
  emit('load-connect','accepted');
}
