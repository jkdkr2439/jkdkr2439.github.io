const text=value=>typeof value==='string'&&value.trim().length>0;
const copy=value=>text(value?.vi)&&text(value?.en);
const secure=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value)}return value};
export function validateConnect(source){
  if(!copy(source?.heading)||!copy(source?.title)||!copy(source?.description))return{ok:false,code:'INVALID_CONNECT_COPY'};
  if(!Array.isArray(source.links)||source.links.length===0)return{ok:false,code:'INVALID_CONNECT_LINKS'};
  const ids=new Set();
  for(const link of source.links){if(!text(link?.id)||ids.has(link.id))return{ok:false,code:'INVALID_CONNECT_ID'};ids.add(link.id);if(!secure(link.url))return{ok:false,code:'INVALID_CONNECT_URL'};if(!copy(link.label))return{ok:false,code:'INVALID_CONNECT_COPY'}}
  return{ok:true,value:freeze(structuredClone(source))};
}
