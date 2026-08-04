const STATES = new Set(['active', 'planned', 'disabled']);
const REQUIRED = ['id','version','route','slot','entry','builder','health_contract','dependencies','capabilities'];
const text = value => typeof value === 'string' && value.trim().length > 0;

const valid = module => Boolean(module && REQUIRED.every(key => key in module) &&
  REQUIRED.slice(0, 7).every(key => text(module[key])) &&
  text(module.labels?.vi) && text(module.labels?.en) &&
  text(module.purpose?.vi) && text(module.purpose?.en) &&
  Array.isArray(module.dependencies) && Array.isArray(module.capabilities));

export function validateRegistry(value) {
  const accepted = [], disabled = [], rejected = [];
  const ids = new Set(), routes = new Set();
  for (const source of Array.isArray(value?.modules) ? value.modules : []) {
    const module = structuredClone(source);
    if (!valid(module)) { rejected.push({moduleId:text(module?.id)?module.id:'unknown',code:'INVALID_MODULE_MANIFEST'}); continue; }
    if (ids.has(module.id)) { rejected.push({moduleId:module.id,code:'DUPLICATE_MODULE_ID'}); continue; }
    ids.add(module.id);
    if (routes.has(module.route)) { rejected.push({moduleId:module.id,code:'DUPLICATE_MODULE_ROUTE'}); continue; }
    routes.add(module.route);
    if (!STATES.has(module.state)) { rejected.push({moduleId:module.id,code:'UNSUPPORTED_MODULE_STATE'}); continue; }
    (module.state === 'disabled' ? disabled : accepted).push(module);
  }
  return {accepted, disabled, rejected};
}
