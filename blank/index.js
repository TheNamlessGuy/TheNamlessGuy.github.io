const cursorTimeout = null;
function hideCursor() {
  if (cursorTimeout != null) {
    clearTimeout();
  }

  document.body.classList.remove('hidden-cursor');
  cursorTimeout = setTimeout(() => {
    document.body.classList.add('hidden-cursor');
  }, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('keyup', (e) => {
    if (e.key === 'f') {
      document.body.requestFullscreen();
    }
  });

  window.addEventListener('mousemove', hideCursor);
  hideCursor();
});