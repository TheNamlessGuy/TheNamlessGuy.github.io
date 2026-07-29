import { genericStylesheet } from '../generic-stylesheet.mjs';

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
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
  border-color: var(--separator-color-0);
}
div.faded::before, div.faded::after { border-color: var(--separator-color-1); }

div:not(:empty)::before { margin-right: 10px; }
div:not(:empty)::after { margin-left: 10px; }

div.sizeless { margin: 0 0; }
div.small { margin: 7px 0; }
div.large { margin: 30px 0; }
`);

export class CustomSeparatorElement extends HTMLElement {
  /**
   * @param {object} options
   * @param {'primary'|'faded'} [options.intensity]
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
      this.intensity('faded');
    } else { // this.hasAttribute('primary') || options.intensity === 'primary' || none defined
      this.intensity('primary');
    }

    if (this.hasAttribute('sizeless') || options.size === 'sizeless') {
      this.size('sizeless');
    } else if (this.hasAttribute('small') || options.size === 'small') {
      this.size('small');
    } else if (this.hasAttribute('large') || options.size === 'large') {
      this.size('large');
    } else { // this.hasAttribute('medium')  || options.size === 'medium' || none defined
      this.size('medium');
    }

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.adoptedStyleSheets = [genericStylesheet, stylesheet];
    shadow.append(this._element);
  }

  /** @param {'primary'|'faded'} value  */
  intensity(value) {
    this._element.classList.toggle('faded', value === 'faded');
  }

  /** @param {'sizeless'|'small'|'medium'|'large'} value  */
  size(value) {
    this._element.classList.toggle('sizeless', value === 'sizeless');
    this._element.classList.toggle('small', value === 'small');
    // medium is the default, so no need for a class
    this._element.classList.toggle('large', value === 'large');
  }

  /** @type {HTMLDivElement} */
  _element = null;
}

onDOMContentLoaded(() => customElements.define('c-separator', CustomSeparatorElement));
