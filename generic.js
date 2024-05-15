const Theme = {
  /**
   * @param {'light'|'dark'} to
   */
  set: (to) => {
    document.body.classList.toggle('theme-dark', to === 'dark');
    document.body.classList.toggle('theme-light', to === 'light');
  },
}

window.addEventListener('DOMContentLoaded', () => {
  function scrollbarWidth() {
    // https://stackoverflow.com/a/28361560
    const tmp = document.createElement('div');
    tmp.style.width = '100px';
    tmp.style.height = '100px';
    tmp.style.overflow = 'scroll';
    tmp.style.position = 'absolute';
    tmp.style.top = '-99999999px';
    document.body.append(tmp);

    const width = tmp.offsetWidth - tmp.clientWidth;
    tmp.remove();
    return width;
  }
  document.documentElement.style.minWidth = `calc(100vw - ${scrollbarWidth()}px)`;

  if (document.title) {
    document.title += ' - Namless Things';
  } else {
    document.title = 'Namless Things';
  }

  if (!window.matchMedia) {
    Theme.set('light');
  } else {
    Theme.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) { Theme.set(event.match ? 'dark' : 'light') });
  }
});