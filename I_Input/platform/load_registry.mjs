export async function loadJson(url) {
  const response = await fetch(url,{credentials:'same-origin',cache:'no-store'});
  if (!response.ok) throw new Error('RESOURCE_UNAVAILABLE');
  return response.json();
}
export const loadRegistry = () => loadJson('/canvas/D_Data/platform/registry/modules.json');
export const loadIdentity = () => loadJson('/canvas/D_Data/platform/identity/site.json');
