const Theme = {
  /**
   * @param {'light'|'dark'} to
   */
  set: (to) => {
    document.body.classList.toggle('theme-dark', to === 'dark');
    document.body.classList.toggle('theme-light', to === 'light');
  },
};

const Random = {
  bool: function() { return Math.random() < 0.5; },
  integer: function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  element: function(array) { return array[Random.integer(0, array.length - 1)]; },
};

const QueryParameters = {
  set: function(key, value) {
    const url = new URL(window.location.href);

    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }

    window.history.replaceState(null, '', url.toString());
  },

  get: function(key, defaultValue = null) {
    const url = new URL(window.location.href);
    if (url.searchParams.has(key)) {
      return url.searchParams.get(key);
    }

    return defaultValue;
  },

  has: function(key) {
    return new URL(window.location.href).searchParams.has(key);
  },
};

Math.clamp = function(min, value, max) {
  if (value < min) { return min; }
  if (value > max) { return max; }
  return value;
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