import { genericStylesheet } from '../generic-stylesheet.mjs';

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
div {
  display: flex;
  align-items: center;
  text-align: center;
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

div.sizeless { margin: 0 0; }
div.small { margin: 7px 0; }
div.medium { margin: 15px 0; }
div.large { margin: 30px 0; }
`);

export class CustomSeparatorElement extends HTMLElement {
  /**
   * @param {object} options
   * @param {'faded'|'primary'} [options.intensity]
   * @param {'sizeless'|'small'|'medium'|'large'} [options.size]
   */
  constructor(options = {}) {
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

    if (this.hasAttribute('faded') || options.intensity === 'faded') {
      this.faded();
    } else {
      this.primary();
    }

    if (this.hasAttribute('sizeless') || options.size === 'sizeless') {
      this.sizeless();
    } else if (this.hasAttribute('small') || options.size === 'small') {
      this.small();
    } else if (this.hasAttribute('large') || options.size === 'large') {
      this.large();
    } else { // this.hasAttribute('medium')  || options.size === 'medium' || none defined
      this.medium();
    }

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.adoptedStyleSheets = [genericStylesheet, stylesheet];
    shadow.append(this._element);
  }

  faded() {
    this._element.classList.remove('primary');
    this._element.classList.add('faded');
  }

  primary() {
    this._element.classList.add('primary');
    this._element.classList.remove('faded');
  }

  sizeless() {
    this._element.classList.remove('small', 'medium', 'large');
    this._element.classList.add('sizeless');
  }

  small() {
    this._element.classList.remove('sizeless', 'medium', 'large');
    this._element.classList.add('small');
  }

  medium() {
    this._element.classList.remove('sizeless', 'small', 'large');
    this._element.classList.add('medium');
  }

  large() {
    this._element.classList.remove('sizeless', 'small', 'medium');
    this._element.classList.add('large');
  }

  /** @type {HTMLDivElement} */
  _element = null;
}

onDOMContentLoaded(() => customElements.define('c-separator', CustomSeparatorElement));
