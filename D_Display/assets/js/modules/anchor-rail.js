// IPOD — Input: trusted domain button clicks. Process: validate local control.
// Output: canvas.select-domain. Dependencies: Anchor zone and public canvas API.
(function () {
  const root = document.querySelector('[data-module="knowledge-domains"]');
  root.addEventListener('click', event => {
    if (!event.isTrusted || event.button !== 0 || !(event.target instanceof Element)) return;
    const control = event.target.closest('[data-canvas-action="select-domain"]');
    if (!control || !root.contains(control)) return;
    window.DNHCanvas.selectDomain(control.dataset.domain);
  });
})();
