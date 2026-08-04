import { loadIdentity, loadRegistry } from '../../I_Input/platform/load_registry.mjs';
import { createShell } from '../../D_Display/platform/shell.mjs';
import { mount as mountDestination } from '../../D_Display/platform/destination.mjs';
import { createLocaleService } from './locale.mjs';
import { createRuntime } from './runtime.mjs';
import { resolveLegacyLocation } from './compatibility.mjs';

const root = document.getElementById('platform-root');
const legacyTarget = resolveLegacyLocation(window.location.href);
if (legacyTarget) window.location.replace(legacyTarget);
async function boot() {
  if (legacyTarget) return;
  let identity;
  try { identity = await loadIdentity(); } catch { root.textContent = 'IDENTITY_UNAVAILABLE'; return; }
  const locale = createLocaleService('vi',['vi','en'],{
    read:()=>localStorage.getItem('interfaceLanguage'),
    write:value=>localStorage.setItem('interfaceLanguage',value),
  });
  const shell = createShell(root,identity,locale);
  const runtime = createRuntime({loadRegistry,loadModule:async()=>({mount:mountDestination}),shell,identity,locale});
  await runtime.boot();
}
boot();
