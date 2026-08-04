import { validateRegistry } from './contracts.mjs';
import { createEventStream } from './events.mjs';

export function createRuntime({loadRegistry, loadModule, shell, identity, locale, clock}) {
  const stream = createEventStream(clock);
  const fail = (id, code) => { shell.showFailure(code, id); stream.emit(id,'P_Process','fault-boundary','rejected',code); };
  return { async boot() {
    let registry;
    try { registry = await loadRegistry(); stream.emit('canvas','I_Input','load-registry','accepted'); }
    catch { fail('canvas','REGISTRY_UNAVAILABLE'); stream.emit('canvas','O_Output','publish-runtime-report','degraded','REGISTRY_UNAVAILABLE'); return {ok:false,mounted:[],rejected:[],events:stream.snapshot()}; }
    const validation = validateRegistry(registry);
    stream.emit('canvas','P_Process','validate-registry','accepted');
    for (const rejection of validation.rejected) fail(rejection.moduleId,rejection.code);
    const mounted = [];
    for (const manifest of validation.accepted) {
      try {
        const adapter = await loadModule(manifest);
        if (typeof adapter.mount !== 'function') throw new Error('INVALID_ADAPTER');
        await adapter.mount({manifest:structuredClone(manifest),identity:structuredClone(identity),locale,slot:shell.slot(manifest.slot),emit:(action,result,code)=>stream.emit(manifest.id,'P_Process',action,result,code),navigate:route=>shell.navigate?.(route)});
        mounted.push(manifest.id); stream.emit(manifest.id,'P_Process','mount-module','accepted');
      } catch { fail(manifest.id,'MODULE_MOUNT_FAILED'); }
    }
    shell.setStatus({mounted:mounted.length,total:validation.accepted.length});
    stream.emit('canvas','O_Output','publish-runtime-report',validation.rejected.length?'degraded':'accepted');
    return {ok:validation.rejected.length===0,mounted,rejected:validation.rejected,events:stream.snapshot()};
  }};
}
