class CustomSeparatorElement extends HTMLElement {
  _element = null;

  constructor() {
    super();

    this._element = document.createElement('div');
    while (this.hasChildNodes()) {
      const node = this.childNodes[0];
      node.remove();

      if (node.nodeType === Node.TEXT_NODE) {
        const span = document.createElement('span');
        span.classList.add('whitespace-pre');
        span.innerText = node.textContent;
        this._element.append(span);
      } else {
        this._element.append(node);
      }
    }

    if (this.hasAttribute('faded')) {
      this.faded();
    } else {
      this.primary();
    }

    const style = document.createElement('style');
    style.textContent = `
@import url("/generic.css");

div {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 15px 0;
}

div::before,
div::after {
  content: '';
  flex-grow: 1;
  border-bottom: 1px solid;
}

div:not(:empty)::before { margin-right: 10px; }
div:not(:empty)::after { margin-left: 10px; }

div.primary::before, div.primary::after { border-color: var(--separator-color-0); }
div.faded::before, div.faded::after { border-color: var(--separator-color-1); }
`;

    this.attachShadow({mode: 'closed'}).append(style, this._element);
  }

  faded() {
    this._element.classList.remove('primary');
    this._element.classList.add('faded');
  }

  primary() {
    this._element.classList.add('primary');
    this._element.classList.remove('faded');
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-separator', CustomSeparatorElement));