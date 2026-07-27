class CustomTextModifierElement extends HTMLElement {
  /** @param {TemplateConfig_Text} modifier */
  constructor(modifier) {
    super();

    this._modifier = modifier;

    const style = document.createElement('style');
    style.textContent = `
@import url("/generic.css");

fieldset {
  border: 2px solid var(--separator-color-1);
  border-radius: 5px;
  margin: 5px;
  padding: 5px;
}

textarea {
  resize: none;
  width: 90%;
  min-height: 100px;
}
`;

    const container = document.createElement('fieldset');

    const legend = document.createElement('legend');
    legend.textContent = this._modifier.title;
    container.append(legend);

    this._textArea = document.createElement('textarea');
    this._textArea.placeholder = `'${this._modifier.title}' text`;
    container.append(this._textArea);

    // TODO: Advanced options

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  /** @returns {ImageRenderModifier_Text} */
  getModifier() {
    return {
      type: 'text',

      x: this._modifier.x,
      y: this._modifier.y,
      w: this._modifier.w,
      h: this._modifier.h,

      text: this._textArea.value,

      color: this._modifier.defaultColor,
      background: this._modifier.defaultBackground ?? null,
    };
  }

  /** @type {TemplateConfig_Text} */
  _modifier = null;

  /** @type {HTMLTextAreaElement} */
  _textArea = null;
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-text-modifier', CustomTextModifierElement));
