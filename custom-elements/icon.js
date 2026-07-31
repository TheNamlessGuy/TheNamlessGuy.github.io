class CustomIconElement extends HTMLElement {
  static map = {
    'home': '⌂',
    'back': '⮜',
    'sort-asc-desc': '⬍',
    'up': '⮝',
    'down': '⮟',
    'revert': '↺',
    'plus': '+',
    'x': '⨯',
  };

  /**
   * @param {keyof typeof CustomIconElement.map} key
   * @returns {string}
   */
  static getIcon(key) { return CustomIconElement.map[key]; } // TODO: This should probably be separate from the element

  constructor() {
    super();

    this._elements.icon = document.createElement('span');
    this.icon = /** @type {keyof typeof CustomIconElement.map} */ (this.innerText);

    this._elements.link = document.createElement('a');

    const style = document.createElement('style');
    style.textContent = `
@import url("/generic.css");

a {
  text-decoration: none;
  color: var(--text-color-0) !important;
}
`;

    this._elements.shadow = this.attachShadow({mode: 'closed'})
    this._elements.shadow.append(style);
    this._setElement();

    this.size = this.getAttribute('size');
    this.url = this.getAttribute('url');
  }

  get icon() { return this._icon; }
  set icon(icon) {
    this._icon = icon;

    if (icon in CustomIconElement.map) {
      this._elements.icon.innerText = CustomIconElement.map[icon];
    } else {
      this._elements.icon.innerText = `What is a '${icon}'?`;
    }
  }

  set size(size) { this._elements.icon.style.fontSize = size; }
  set url(url) { this._elements.link.href = url ?? ''; this._setElement(); }

  /** @type {keyof typeof CustomIconElement.map} */
  _icon = null;
  _elements = {
    /** @type {ShadowRoot} */
    shadow: null,
    /** @type {HTMLSpanElement} */
    icon: null,
    /** @type {HTMLAnchorElement} */
    link: null,
  };

  _setElement() {
    if (this._elements.shadow == null) { return; } // If this is the case, we'll come back here in a few lines

    if (this._elements.link.href === window.location.href) {
      this._elements.link.remove();
      this._elements.shadow.append(this._elements.icon);
    } else {
      this._elements.link.append(this._elements.icon);
      this._elements.shadow.append(this._elements.link);
    }
  }
}

class CustomHeaderIconElement extends CustomIconElement {
  static trimURLSegment(url, amount) { // TODO: Why is this here? This is definitely an unrelated helper function
    url = new URL(url).pathname;

    while (url.startsWith('/')) { url = url.substring(1); }
    while (url.endsWith('/')) { url = url.substring(0, url.length - 1); }

    url = url.split('/');
    for (let i = 0; i < amount; ++i) { url.pop(); }
    url = '/' + url.join('/');
    if (url.length > 1) { url += '/'; }

    return url;
  }

  static map = {
    'home': {size: '200%', url: '/', title: 'Home'},
    'back': {size: '200%', url: () => this.trimURLSegment(window.location.href, 1), title: 'Back'},
  };

  constructor() {
    super();

    if (this._icon in CustomHeaderIconElement.map) {
      const data = CustomHeaderIconElement.map[this._icon];

      if (data.size && !this.hasAttribute('size')) {
        this.size = data.size;
      }

      if (data.url && !this.hasAttribute('url')) {
        this.url = (typeof data.url === 'function') ? data.url() : data.url;
      }

      if (data.title && !this.hasAttribute('title')) {
        this.title = data.title;
      }
    }
  }
}

onDOMContentLoaded(() => {
  customElements.define('c-icon', CustomIconElement);
  customElements.define('c-header-icon', CustomHeaderIconElement);
});
