// IPOD — Input: trusted context controls. Process: validate local control.
// Output: canvas.toggle-context. Dependencies: Context zone and public canvas API.
(function () {
  const root = document.querySelector('[data-module="context-tree"]');
  root.addEventListener('click', event => {
    if (!event.isTrusted || event.button !== 0 || !(event.target instanceof Element)) return;
    const control = event.target.closest('[data-canvas-action="toggle-context"]');
    if (!control || !root.contains(control)) return;
    window.DNHCanvas.toggleContext();
  });
})();
