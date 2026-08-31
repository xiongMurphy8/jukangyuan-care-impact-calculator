/* Theme and keyboard accessibility only; original submission remains active. */
const media = matchMedia('(prefers-color-scheme: dark)');
const switcher = document.getElementById('theme-switch');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  switcher.textContent = theme === 'dark' ? '切换浅色' : '切换深色';
}
setTheme(media.matches ? 'dark' : 'light');
switcher.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
media.addEventListener('change', event => setTheme(event.matches ? 'dark' : 'light'));
let panel, previousFocus;
document.addEventListener('click', event => {
  if (event.target.closest('.consult-nav,.consult-primary,.consult-secondary,.lead-prompt button,.mobile-consult-bar button:last-child')) previousFocus = document.activeElement;
}, true);
new MutationObserver(() => {
  const next = document.querySelector('.lead-panel');
  if (next && next !== panel) {
    panel = next;
    panel.querySelector('.lead-close')?.setAttribute('aria-label', '关闭人工复核');
  } else if (!next && panel) {
    panel = null;
    previousFocus?.focus();
  }
}).observe(document.getElementById('root'), { childList: true, subtree: true });
document.addEventListener('keydown', event => {
  if (!panel) return;
  if (event.key === 'Escape') panel.querySelector('.lead-close')?.click();
  if (event.key !== 'Tab') return;
  const items = [...panel.querySelectorAll('button:not([disabled]), input, textarea, select, a[href]')].filter(el => el.getClientRects().length);
  if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
  if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
});
