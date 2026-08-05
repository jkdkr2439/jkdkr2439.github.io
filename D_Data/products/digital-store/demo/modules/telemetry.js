export function createTelemetry(){const events=[];return{events,emit(type,data={}){events.push({sequence:events.length+1,type,code:data.code||null})}}}
