import { genericStylesheet } from '../generic-stylesheet.mjs';

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
span {
  display: flex;
  align-items: center;
}

input {
  cursor: pointer;
}
span.small > input {
  width: 4em;
  height: 2em;
}
span.large > input {
  width: 8em;
  height: 4em;
}
`);

export class CustomColorPickerElement extends HTMLElement {
  /**
   * @param {object} options
   * @param {string} [options.value]
   * @param {string} [options.label]
   * @param {'primary'|'faded'} [options.intensity]
   * @param {'small'|'medium'|'large'} [options.size]
   */
  constructor(options = {}) {
    super();

    this._elements.container = document.createElement('span');

    this._elements.label = document.createElement('label');
    this._elements.container.append(this._elements.label);
    if (this.hasAttribute('label')) {
      this.label = this.getAttribute('label');
    } else if (options.label != null) {
      this.label = options.label;
    }

    this._elements.input = document.createElement('input');
    this._elements.input.type = 'color';
    this._elements.container.append(this._elements.input);

    if (this.hasAttribute('faded') || options.intensity === 'faded') {
      this.intensity('faded');
    } else { // this.hasAttribute('primary') || options.intensity === 'primary' || none defined
      this.intensity('primary');
    }

    if (this.hasAttribute('small') || options.size === 'small') {
      this.size('small');
    } else if (this.hasAttribute('large') || options.size === 'large') {
      this.size('large');
    } else { // this.hasAttribute('medium')  || options.size === 'medium' || none defined
      this.size('medium');
    }

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.adoptedStyleSheets = [genericStylesheet, stylesheet];
    shadow.append(this._elements.container);

    this.value = options.value ?? '#000000';
  }

  get label() {
    return this._elements.label.textContent;
  }
  set label(value) {
    this._elements.label.textContent = value ?? '';
    if (value === '' || value == null) {
      this._elements.label.style.marginRight = null;
    } else {
      this._elements.label.style.marginRight = '5px';
    }
  }

  get value() { return this._elements.input.value; }
  set value(value) { this._elements.input.value = value; }

  /** @param {'primary'|'faded'} value  */
  intensity(value) {
    this._elements.input.classList.toggle('faded', value === 'faded');
  }

  /** @param {'small'|'medium'|'large'} value  */
  size(value) {
    this._elements.container.classList.toggle('small', value === 'small');
    // medium is the default, so no need for a class
    this._elements.container.classList.toggle('large', value === 'large');
  }

  _elements = {
    /** @type {HTMLSpanElement} */
    container: null,

    /** @type {HTMLLabelElement} */
    label: null,

    /** @type {HTMLInputElement} */
    input: null,
  }
}

onDOMContentLoaded(() => customElements.define('c-color-picker', CustomColorPickerElement));
