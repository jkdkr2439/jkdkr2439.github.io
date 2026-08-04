// IPOD — Input: validated canvas state and route notifications. Process: zone orchestration.
// Output: active module DOM and public canvas API. Dependencies: registry, contracts, store.
(function () {
  const registry = window.DNHCanvasRegistry;
  const contracts = window.DNHCanvasContracts;
  const store = window.DNHCanvasStore;
  const canvas = document.querySelector('[data-site-canvas]');
  const anchorRoot = document.querySelector('[data-module="knowledge-domains"]');
  const contextRoot = document.querySelector('[data-module="context-tree"]');

  function domainRecord(key) {
    return registry.domains.find(domain => domain.key === key) || registry.domains[0];
  }

  function render() {
    const state = store.getState();
    const domain = domainRecord(state.domain);
    canvas.classList.toggle('is-context-collapsed', state.contextCollapsed);
    anchorRoot.querySelectorAll('[data-domain]').forEach(control => {
      const active = control.dataset.domain === state.domain;
      control.classList.toggle('is-active', active);
      control.setAttribute('aria-pressed', String(active));
    });
    contextRoot.querySelectorAll('[data-context-panel]').forEach(panel => {
      const active = panel.dataset.contextPanel === state.domain;
      panel.classList.toggle('is-active-context', active);
      panel.hidden = !active;
    });
    const title = contextRoot.querySelector('#context-title');
    title.textContent = state.language === 'en' ? domain.labelEn : domain.labelVi;
    const collapse = contextRoot.querySelector('[data-canvas-action="toggle-context"]');
    collapse.setAttribute('aria-expanded', String(!state.contextCollapsed));
  }

  function replaceDomainInAddress(domain) {
    const address = new URL(location.href);
    address.searchParams.set('domain', domain);
    history.replaceState(history.state, '', `${address.pathname}${address.search}${address.hash}`);
  }

  function selectDomain(domain, updateAddress = true) {
    if (!contracts.acceptsDomain(domain)) return store.getState();
    const state = store.setDomain(domain);
    render();
    if (updateAddress) replaceDomainInAddress(state.domain);
    return state;
  }

  function syncRoute(route) {
    let domain = null;
    if (route && route.type === 'book') domain = registry.bookDomains[route.key];
    if (route && route.type === 'post') domain = registry.postDomains[route.url];
    if (domain) selectDomain(domain, false);
    return store.getState().domain;
  }

  window.DNHCanvas = Object.freeze({
    selectDomain,
    toggleContext: () => { const state = store.toggleContext(); render(); return state; },
    syncRoute,
    setLanguage: language => { const state = store.setLanguage(language); render(); return state; },
    getState: store.getState
  });
  render();
})();
