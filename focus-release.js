// Release transient activation focus without changing pressed/expanded state.
(() => {
  const selector = 'button, a[href], [role="button"]';
  const release = control => queueMicrotask(() => {
    // Keep focus deliberately moved to a dialog or another control.
    if (control && document.activeElement === control) control.blur();
  });
  document.addEventListener('click', event => release(event.target.closest?.(selector)));
  let keyboardControl = null;
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      // Native buttons/links release through their activation click.
      keyboardControl = event.target.closest?.('[role="button"]:not(button):not(a)');
    }
  }, true);
  document.addEventListener('keyup', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const control = keyboardControl;
    keyboardControl = null;
    release(control);
  });
})();
