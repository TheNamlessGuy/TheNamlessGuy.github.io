import { genericStylesheet } from '../generic-stylesheet.mjs';

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(``);

export class CustomSelectElement extends HTMLElement {
  /**
   * @param {object} options
   * @param {'primary'|'faded'} [options.intensity]
   */
  constructor(options = {}) {
    super();

    const element = document.createElement('div');

    this._elements.label = document.createElement('span');
    element.append(this._elements.label);
    if (this.hasAttribute('label')) { this.label = this.getAttribute('label'); }

    this._elements.select = document.createElement('select');
    this._elements.select.append(...Array.from(this.getElementsByTagName('option')));
    this._elements.select.addEventListener('change', () => {
      this._setWidth();
      this.dispatchEvent(new Event('change'));
    });
    element.append(this._elements.select);

    this._setWidth();

    if (this.hasAttribute('faded') || options.intensity === 'faded') {
      this.intensity('faded');
    } else { // this.hasAttribute('primary') || options.intensity === 'primary' || none defined
      this.intensity('primary');
    }

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.adoptedStyleSheets = [genericStylesheet, stylesheet];
    shadow.append(element);
  }

  get value() { return this._elements.select.value; }
  set value(value) {
    this._elements.select.value = value;
    this.dispatchEvent(new Event('change'));
    this._setWidth();
  }

  /** @param {{id: string, display: string}} option */
  addOption(option) {
    const elem = document.createElement('option');
    elem.value = option.id;
    elem.textContent = option.display;
    this._elements.select.append(elem);
  }

  get label() { return this._elements.label.textContent; }
  set label(value) {
    this._elements.label.textContent = value;
    if (value === '' || value == null) {
      this._elements.label.style.marginRight = null;
    } else {
      this._elements.label.style.marginRight = '5px';
    }
  }

  /** @param {'primary'|'faded'} value  */
  intensity(value) {
    this._elements.select.classList.toggle('faded', value === 'faded');
  }

  _elements = {
    /** @type {HTMLSelectElement} */
    select: null,

    /** @type {HTMLSpanElement} */
    label: null,
  };

  _setWidth() {
    if (this._elements.select.options.length === 0) { return; }

    const dummySelect = document.createElement('select');
    dummySelect.style.visibility = 'hidden';

    const dummyOption = document.createElement('option');
    dummyOption.innerText = this._elements.select.options[this._elements.select.selectedIndex].innerText;
    dummySelect.append(dummyOption);

    document.body.append(dummySelect);
    this._elements.select.style.width = `${dummySelect.offsetWidth}px`;

    dummySelect.remove();
  }
}

onDOMContentLoaded(() => customElements.define('c-select', CustomSelectElement));
