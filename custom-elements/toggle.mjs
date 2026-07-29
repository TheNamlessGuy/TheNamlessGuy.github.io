import { genericStylesheet } from '../generic-stylesheet.mjs';

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
span.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
}

label { user-select: none; }

span.toggle {
  --size: 26px;
  --padding: 4px;
  --height: calc(var(--size) + var(--padding) * 2);
  --width: calc(var(--size) * 2 + var(--padding) * 2);
}
span.toggle.small {
  --size: 15px;
  --padding: 2px;
}
span.toggle.large {
  --size: 40px;
  --padding: 8px;
}

span.toggle {
  display: inline-block;
  position: relative;
  width: var(--width);
  height: var(--height);
  background-color: var(--bg-color-0);
  border: 1px solid var(--separator-color-0);
  border-radius: var(--height);
  transition: 0.1s;
  cursor: pointer;
}
span.toggle.faded { border-color: var(--separator-color-1); }

span.toggle:before {
  position: absolute;
  content: "";
  height: var(--size);
  width: var(--size);
  left: var(--padding);
  bottom: var(--padding);
  background-color: var(--text-color-0);
  transition: 0.1s;
  border-radius: 50%;
}

span.toggle.checked { background-color: var(--bg-color-2); }
span.toggle.checked:before { transform: translateX(var(--size)); }
`);

export class CustomToggleElement extends HTMLElement {
  /**
   * @param {object} options
   * @param {boolean} [options.checked]
   * @param {string} [options.leftLabel]
   * @param {string} [options.rightLabel]
   * @param {'primary'|'faded'} [options.intensity]
   * @param {'small'|'medium'|'large'} [options.size]
   */
  constructor(options = {}) {
    super();

    const container = document.createElement('span');
    container.classList.add('container');

    this._elements.leftLabel = document.createElement('label');
    container.append(this._elements.leftLabel);
    if (this.hasAttribute('left-label')) {
      this.leftLabel = this.getAttribute('left-label');
    } else if (options.leftLabel != null) {
      this.leftLabel = options.leftLabel;
    }

    this._elements.toggle = document.createElement('span');
    this._elements.toggle.classList.add('toggle');
    if (this.hasAttribute('checked')) {
      this.checked = true;
    } else if ('checked' in options) {
      this.checked = options.checked;
    }
    this._elements.toggle.addEventListener('click', this.toggle.bind(this));
    container.append(this._elements.toggle);

    this._elements.rightLabel = document.createElement('label');
    container.append(this._elements.rightLabel);
    if (this.hasAttribute('right-label')) {
      this.rightLabel = this.getAttribute('right-label');
    } else if (options.rightLabel != null) {
      this.rightLabel = options.rightLabel;
    }

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
    shadow.append(container);
  }

  _elements = {
    /** @type {HTMLLabelElement} */
    leftLabel: null,

    /** @type {HTMLSpanElement} */
    toggle: null,

    /** @type {HTMLLabelElement} */
    rightLabel: null,
  }

  get checked() { return this._elements.toggle.classList.contains('checked'); }
  /** @param {boolean} value */
  set checked(value) { this._elements.toggle.classList.toggle('checked', value); }

  toggle() { this.checked = !this.checked; }

  get leftLabel() { return this._elements.leftLabel.textContent; }
  /** @param {string} value */
  set leftLabel(value) {
    this._elements.leftLabel.textContent = value ?? '';
    if (value === '' || value == null) {
      this._elements.leftLabel.style.marginRight = null;
    } else {
      this._elements.leftLabel.style.marginRight = '5px';
    }
  }

  get rightLabel() { return this._elements.rightLabel.textContent; }
  /** @param {string} value */
  set rightLabel(value) {
    this._elements.rightLabel.textContent = value ?? '';
    if (value === '' || value == null) {
      this._elements.rightLabel.style.marginLeft = null;
    } else {
      this._elements.rightLabel.style.marginLeft = '5px';
    }
  }

  /** @param {'primary'|'faded'} value  */
  intensity(value) {
    this._elements.toggle.classList.toggle('faded', value === 'faded');
  }

  /** @param {'small'|'medium'|'large'} value  */
  size(value) {
    this._elements.toggle.classList.toggle('small', value === 'small');
    // medium is the default, so no need for a class
    this._elements.toggle.classList.toggle('large', value === 'large');
  }
}

onDOMContentLoaded(() => customElements.define('c-toggle', CustomToggleElement));
