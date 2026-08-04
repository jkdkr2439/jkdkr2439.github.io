import { loadIdentity, loadRegistry } from '../../I_Input/platform/load_registry.mjs';
import { loadMedia } from '../../I_Input/platform/load_media.mjs';
import { loadConnect } from '../../I_Input/platform/load_connect.mjs';
import { createShell } from '../../D_Display/platform/shell.mjs';
import { mount as mountDestination } from '../../D_Display/platform/destination.mjs';
import { createMediaPanel } from '../../D_Display/platform/media/panel.mjs';
import { mount as mountConnect } from '../../D_Display/platform/connect/frame.mjs';
import { createLocaleService } from './locale.mjs';
import { createRuntime } from './runtime.mjs';
import { createMediaController } from './media/controller.mjs';
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
  const mediaView = createMediaPanel(shell.slot('media'));
  const runtime = createRuntime({loadRegistry,loadModule:async manifest=>manifest.entry==='media'?({
    mount(args){
      const controller=createMediaController({load:loadMedia,view:mediaView,locale,emit:args.emit});
      return controller.mount();
    }
  }):manifest.entry==='connect'?({mount(args){return mountConnect({...args,load:loadConnect})}}):({mount:mountDestination}),shell,identity,locale});
  await runtime.boot();
  if(window.location.hash==='#media')document.querySelector('#media')?.setAttribute('tabindex','-1');
}
boot();
