import { genericStylesheet } from '../generic-stylesheet.mjs';
import { stringIsNumeric } from '../helpers.mjs';

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
span.container {
  display: flex;
  align-items: center;
}

label { white-space: nowrap; }

span.input-container {
  display: inline-flex;
  block-size: 1.8em;
  border: 1px solid var(--separator-color-0);
  border-radius: 5px;
  overflow: hidden;
  box-sizing: border-box;
}
span.container.faded > span.input-container { border-color: var(--separator-color-1); }

span.input-container > input {
  border: 0;
  border-radius: 0;
}

span.input-container > span.button-container {
  display: flex;
  flex-direction: column;
  inline-size: 1.6em;
  border-left: 1px solid var(--separator-color-1);
}

span.input-container > span.button-container > button {
  flex-grow: 1;
  flex-shrink: 1;
  min-block-size: 0;

  border: 0;
  border-radius: 0;
  padding: 0;

  font-size: 0.7em;
  line-height: 1;
}

button.revert { margin-left: 5px; }
button.revert.hidden { margin-left: 0; }
span.container.faded button.revert { border-color: var(--separator-color-1); }
`);

export class CustomNumberInputElement extends HTMLElement {
  /**
   * @param {object} options
   * @param {number} [options.value]
   * @param {number} [options.defaultValue]
   * @param {number} [options.min]
   * @param {number} [options.max]
   * @param {string} [options.label]
   * @param {'primary'|'faded'} [options.intensity]
   */
  constructor(options = {}) {
    super();

    this._min = options.min ?? null;
    this._max = options.max ?? null;

    this._elements.container = document.createElement('span');
    this._elements.container.classList.add('container');

    this._elements.label = document.createElement('label');
    this._elements.container.append(this._elements.label);
    if (this.hasAttribute('label')) {
      this.label = this.getAttribute('label');
    } else if (options.label != null) {
      this.label = options.label;
    }

    const inputContainer = document.createElement('span');
    inputContainer.classList.add('input-container');
    this._elements.container.append(inputContainer);

    this._elements.input = document.createElement('input');
    this._elements.input.addEventListener('input', this._onInputChange.bind(this));
    this._elements.input.addEventListener('blur', this._onInputBlur.bind(this));
    inputContainer.append(this._elements.input);

    const buttonContainer = document.createElement('span');
    buttonContainer.classList.add('button-container');
    inputContainer.append(buttonContainer);

    const up = document.createElement('button');
    up.classList.add('up');
    up.innerText = CustomIconElement.getIcon('up');
    up.addEventListener('click', this._onUpClicked.bind(this));
    buttonContainer.append(up);

    const down = document.createElement('button');
    down.classList.add('down');
    down.innerText = CustomIconElement.getIcon('down');
    down.addEventListener('click', this._onDownClicked.bind(this));
    buttonContainer.append(down);

    this._elements.revert = document.createElement('button');
    this._elements.revert.classList.add('revert');
    this._elements.revert.innerText = CustomIconElement.getIcon('revert');
    this._elements.revert.addEventListener('click', this._onRevert.bind(this));
    this._elements.container.append(this._elements.revert);

    if (this.hasAttribute('faded') || options.intensity === 'faded') {
      this.intensity('faded');
    } else { // this.hasAttribute('primary') || options.intensity === 'primary' || none defined
      this.intensity('primary');
    }

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.adoptedStyleSheets = [genericStylesheet, stylesheet];
    shadow.append(this._elements.container);

    this.defaultValue = options.defaultValue ?? 5;
    this.value = options.value ?? 0;
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

  get value() {
    const value = this._elements.input.value;
    if (!stringIsNumeric(value)) {
      return null;
    }

    return parseFloat(value);
  }
  set value(value) {
    if (typeof value !== 'number') {
      this._elements.input.value = '';
    } else if (this._min != null && value < this._min) {
      this._elements.input.value = this._min.toString(10);
    } else if (this._max != null && value > this._max) {
      this._elements.input.value = this._max.toString(10);
    } else {
      this._elements.input.value = value.toString(10);
    }

    this._lastValidValue = this._elements.input.value;
    this._setRevertButtonState();
  }

  get defaultValue() { return this._defaultValue; }
  set defaultValue(value) {
    this._defaultValue = value;
    this._setRevertButtonState();
  }

  /** @param {'primary'|'faded'} value  */
  intensity(value) {
    this._elements.container.classList.toggle('faded', value === 'faded');
  }

  _elements = {
    /** @type {HTMLSpanElement} */
    container: null,

    /** @type {HTMLLabelElement} */
    label: null,

    /** @type {HTMLInputElement} */
    input: null,

    /** @type {HTMLButtonElement} */
    revert: null,
  }

  /** @type {number|null} */
  _min = null;
  /** @type {number|null} */
  _max = null;

  /** @type {string|null} */
  _lastValidValue = null;

  /** @type {number|null} */
  _defaultValue = null;

  _onInputChange() {
    const value = this._elements.input.value;

    if (value === '') {
      this._lastValidValue = null;
    } else if (value === '-') {
      // user is probably writing a negative number
      this._lastValidValue = value;
    } else if (value.endsWith('.') && stringIsNumeric(value.substring(0, value.length - 1))) {
      // user is probably writing a float number
      this._lastValidValue = value;
    } else if (!stringIsNumeric(this._elements.input.value)) {
      this._elements.input.value = this._lastValidValue ?? '';
    } else {
      // noop - this._elements.input.value is a valid numeric string
    }

    this._setRevertButtonState();
  }

  _onInputBlur() {
    if (this.value == null) {
      this.value = 0;
    }
  }

  _onUpClicked() { this.value = (this.value ?? 0) + 1; }
  _onDownClicked() { this.value = (this.value ?? 0) - 1; }

  _setRevertButtonState() {
    if (this._defaultValue == null) {
      this._elements.revert.classList.add('hidden');
    } else if (this.defaultValue === this.value) {
      this._elements.revert.disabled = true;
      this._elements.revert.title = 'Revert to default value\n\nValue is already default';
    } else {
      this._elements.revert.disabled = false;
      this._elements.revert.title = 'Revert to default value';
    }
  }

  _onRevert() { this.value = this.defaultValue; }
}

onDOMContentLoaded(() => customElements.define('c-number-input', CustomNumberInputElement));
