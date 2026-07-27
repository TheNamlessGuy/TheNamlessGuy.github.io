class CustomSelectElement extends HTMLElement {
  constructor() {
    super();

    const element = document.createElement('div');

    if (this.hasAttribute('label')) {
      const label = document.createElement('span');
      label.style.marginRight = '5px';
      label.innerText = this.getAttribute('label');
      element.append(label);
    }

    this._select = document.createElement('select');
    this._select.append(...Array.from(this.getElementsByTagName('option')));
    this._select.addEventListener('change', () => {
      this._setWidth();
      this.dispatchEvent(new Event('change'));
    });
    element.append(this._select);

    this._setWidth();

    const style = document.createElement('style');
    style.textContent = '@import url("/generic.css");';

    this.attachShadow({mode: 'closed'}).append(style, element);
  }

  get value() { return this._select.value; }
  set value(value) {
    this._select.value = value;
    this.dispatchEvent(new Event('change'));
    this._setWidth();
  }

  /** @param {{id: string, display: string}} option */
  addOption(option) {
    const elem = document.createElement('option');
    elem.value = option.id;
    elem.textContent = option.display;
    this._select.append(elem);
  }

  /** @type {HTMLSelectElement} */
  _select = null;

  _setWidth() {
    if (this._select.options.length === 0) { return; }

    const dummySelect = document.createElement('select');
    dummySelect.style.visibility = 'hidden';

    const dummyOption = document.createElement('option');
    dummyOption.innerText = this._select.options[this._select.selectedIndex].innerText;
    dummySelect.append(dummyOption);

    document.body.append(dummySelect);
    this._select.style.width = `${dummySelect.offsetWidth}px`;

    dummySelect.remove();
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-select', CustomSelectElement));
