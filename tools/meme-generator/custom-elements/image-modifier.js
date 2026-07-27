class CustomImageModifierElement extends HTMLElement {
  static _EMPTY_IMAGE_DATA_URL = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>`;

  /** @param {TemplateConfig_Image} modifier */
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
`;

    const container = document.createElement('fieldset');

    const legend = document.createElement('legend');
    legend.textContent = this._modifier.title;
    container.append(legend);

    this._input = document.createElement('input');
    this._input.type = 'file';
    this._input.accept = 'image/jpeg,image/png';
    this._input.addEventListener('change', this._onFileUploaded.bind(this));
    container.append(this._input);

    // TODO: Advanced options

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  /** @returns {ImageRenderModifier_Image} */
  getModifier() {
    return {
      type: 'image',

      x: this._modifier.x,
      y: this._modifier.y,
      w: this._modifier.w,
      h: this._modifier.h,

      path: this._imageDataURL ?? CustomImageModifierElement._EMPTY_IMAGE_DATA_URL,

      fittingType: this._modifier.defaultFittingType,
      opacity: 1,
    };
  }

  /** @type {TemplateConfig_Image} */
  _modifier = null;

  /** @type {HTMLInputElement} */
  _input = null;

  /** @type {string|null} */
  _imageDataURL = null;

  _onFileUploaded() {
    if (this._input.files == null || this._input.files.length === 0 || this._input.files[0] == null) {
      this._imageDataURL = null;
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this._imageDataURL = /** @type {string} */ (reader.result);
    });

    reader.readAsDataURL(this._input.files[0]);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-image-modifier', CustomImageModifierElement));
