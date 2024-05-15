class CustomHTMLElement extends HTMLElement {
  static key = null;

  static _styleSheet = null;
  static style = null;

  static setup() {
    if (this.style) {
      this._styleSheet = new CSSStyleSheet();
      this._styleSheet.replace(this.style);
    }

    customElements.define(this.key, this);
  }

  constructor() {
    super();

    const elements = this.init();

    const style = document.createElement('style');
    style.textContent = '@import url("/generic.css");'; // Fuck you for this, API designers

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.append(style, ...elements);
    if (this.constructor._styleSheet) {
      shadow.adoptedStyleSheets = [this.constructor._styleSheet];
    }
  }

  init() { return []; }
}