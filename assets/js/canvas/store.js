// IPOD — Input: registry, URL and presentation preference. Process: state transitions.
// Output: immutable snapshots. Dependencies: contracts and localStorage.
(function () {
  const registry = window.DNHCanvasRegistry;
  const contracts = window.DNHCanvasContracts;
  const requested = new URLSearchParams(location.search).get('domain');
  let collapsed = false;
  try { collapsed = localStorage.getItem('canvas.contextCollapsed') === 'true'; } catch (_) {}
  let state = {
    domain: contracts.acceptsDomain(requested) ? requested : registry.defaultDomain,
    contextCollapsed: collapsed,
    language: 'vi'
  };

  function commit(patch) {
    state = Object.freeze({...state, ...patch});
    return state;
  }

  window.DNHCanvasStore = Object.freeze({
    getState: () => state,
    setDomain: domain => {
      if (!contracts.acceptsDomain(domain)) return state;
      try { localStorage.setItem('canvas.contextCollapsed', 'false'); } catch (_) {}
      return commit({domain, contextCollapsed: false});
    },
    toggleContext: () => {
      const next = !state.contextCollapsed;
      try { localStorage.setItem('canvas.contextCollapsed', String(next)); } catch (_) {}
      return commit({contextCollapsed: next});
    },
    setLanguage: language => commit({language: contracts.language(language)})
  });
})();
