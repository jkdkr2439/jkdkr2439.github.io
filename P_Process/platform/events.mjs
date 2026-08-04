export function createEventStream(clock = () => new Date().toISOString()) {
  const events = [];
  return {
    emit(moduleId, phase, action, result, code = null) {
      events.push({sequence:events.length+1,timestamp:clock(),moduleId,phase,action,result,code});
    },
    snapshot: () => structuredClone(events),
  };
}
