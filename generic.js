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
};

const Hotkeys = {
  /** @type {{combo: {shift: boolean, ctrl: boolean, alt: boolean, meta: boolean, key: string}, callback: (e: KeyboardEvent) => void}[]} */
  _registered: [],

  init: function() {
    document.addEventListener('keyup', Hotkeys._onKeyUp);
  },

  /**
   * @param {{shift?: boolean, ctrl?: boolean, alt?: boolean, meta?: boolean, key: string}} combo
   * @param {(e: KeyboardEvent) => void} callback
   */
  register: function(combo, callback) {
    Hotkeys._registered.push({
      callback: callback,
      combo: {
        key:   combo.key,
        shift: combo.shift ?? false,
        ctrl:  combo.ctrl  ?? false,
        alt:   combo.alt   ?? false,
        meta:  combo.meta  ?? false,
      },
    });
  },

  _activeElementIsTextEditable: function() {
    const active = document.activeElement;

    if (active.nodeType !== Node.ELEMENT_NODE) { return false; }
    if (active.isContentEditable) { return true; }
    if (active.tagName.toLowerCase() === 'textarea') { return !active.readOnly && !active.disabled; }
    if (active.tagName.toLowerCase() === 'input') { return ['email', 'number', 'password', 'search', 'tel', 'text', 'url'].includes(active.type); }

    return false;
  },

  /**
   * @param {KeyboardEvent} e
   * @returns
   */
  _onKeyUp: function(e) {
    if (Hotkeys._activeElementIsTextEditable()) { return; }

    for (const hotkey of Hotkeys._registered) {
      if (
        e.key      === hotkey.combo.key   &&
        e.shiftKey === hotkey.combo.shift &&
        e.ctrlKey  === hotkey.combo.ctrl  &&
        e.altKey   === hotkey.combo.alt   &&
        e.metaKey  === hotkey.combo.meta
      ) {
        hotkey.callback(e);
      }
    }
  },
};

const HeaderLinks = {
  init: function() {
    const elements = Array.from(document.querySelectorAll('h2, h3, h4, h5, h6'));

    let titles = ['header'];
    for (const element of elements) {
      const title = HeaderLinks._titleify(element.innerText);
      const level = HeaderLinks._level(element);

      while (titles.length >= level) {
        titles.pop();
      }

      if (titles.length <= level) {
        titles.push(title);
      }

      element.id = titles.join('-');
    }
  },

  _titleify: function(contents) {
    return contents.toLowerCase().replaceAll(/[^a-zA-Z0-9]/g, '_');
  },

  _level: function(element) {
    return parseInt(element.tagName.substring(1), 10);
  },
};

window.addEventListener('DOMContentLoaded', () => {
  if (!window.matchMedia) {
    Theme.set('light');
  } else {
    Theme.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) { Theme.set(event.match ? 'dark' : 'light') });
  }

  Hotkeys.init();
  HeaderLinks.init();

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
});