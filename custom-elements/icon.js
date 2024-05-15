class CustomIconElement extends CustomHTMLElement {
  static key = 'c-icon';
  static style = `
a {
  text-decoration: none;
  color: var(--text-color-0) !important;
}
`;

  static map = {
    'home': '⌂',
    'back': '⮜',
    'sort-asc-desc': '⬍',
  };

  init() {
    let element = document.createElement('div');
    if (this.innerText in CustomIconElement.map) {
      element.innerText = CustomIconElement.map[this.innerText];
    } else {
      element.innerText = `What is a '${this.innerText}'?`;
    }

    if (this.hasAttribute('size')) {
      element.style.fontSize = this.getAttribute('size');
    }

    if (this.hasAttribute('url')) {
      const link = document.createElement('a');
      link.href = this.getAttribute('url');
      link.append(element);
      element = link;
    }

    return [element];
  }
}

class CustomHeaderIconElement extends CustomIconElement {
  static key = 'c-header-icon';

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

  init() {
    if (this.innerText in CustomHeaderIconElement.map) {
      const data = CustomHeaderIconElement.map[this.innerText];

      if (data.size && !this.hasAttribute('size')) {
        this.setAttribute('size', data.size);
      }

      if (data.url && !this.hasAttribute('url')) {
        if (typeof data.url === 'function') {
          this.setAttribute('url', data.url());
        } else {
          this.setAttribute('url', data.url);
        }
      }

      if (data.title && !this.hasAttribute('title')) {
        this.setAttribute('title', data.title);
      }
    }

    return super.init();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  CustomIconElement.setup();
  CustomHeaderIconElement.setup();
});