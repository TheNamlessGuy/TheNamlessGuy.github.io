class CustomIconElement extends HTMLElement {
  static map = {
    'home': '⌂',
    'back': '⮜',
    'sort-asc-desc': '⬍',
  };

  _icon = null;
  _elements = {
    icon: null,
    link: null,
  };

  constructor() {
    super();

    this._elements.icon = document.createElement('div');
    this.icon = this.innerText;

    this.size = this.getAttribute('size');

    this._elements.link = document.createElement('a');
    this._elements.link.append(this._elements.icon);
    this.url = this.getAttribute('url');

    const style = document.createElement('style');
    style.textContent = `
@import url("/generic.css");

a {
  text-decoration: none;
  color: var(--text-color-0) !important;
}
`;

    this.attachShadow({mode: 'closed'}).append(style, this._elements.link.href ? this._elements.link : this._elements.icon);
  }

  set icon(icon) {
    this._icon = icon;

    if (icon in CustomIconElement.map) {
      this._elements.icon.innerText = CustomIconElement.map[icon];
    } else {
      this._elements.icon.innerText = `What is a '${icon}'?`;
    }
  }

  set size(size) { this._elements.icon.style.fontSize = size; }
  set url(url) { this._elements.link.href = url; }
}

class CustomHeaderIconElement extends CustomIconElement {
  static trimURLSegment(url, amount) {
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

window.addEventListener('DOMContentLoaded', () => {
  customElements.define('c-icon', CustomIconElement);
  customElements.define('c-header-icon', CustomHeaderIconElement);
});