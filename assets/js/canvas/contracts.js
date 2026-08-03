// IPOD — Input: external keys/events. Process: allowlist validation.
// Output: booleans and normalized language. Dependencies: canvas registry.
(function () {
  const EVENT_KEYS = Object.freeze([
    'canvas.select-domain',
    'canvas.toggle-context',
    'canvas.sync-route',
    'canvas.set-language'
  ]);

  window.DNHCanvasContracts = Object.freeze({
    eventKeys: EVENT_KEYS,
    acceptsEvent: eventKey => EVENT_KEYS.includes(eventKey),
    acceptsDomain: domainKey => window.DNHCanvasRegistry.domainKeys.includes(domainKey),
    language: value => value === 'en' ? 'en' : 'vi'
  });
})();
