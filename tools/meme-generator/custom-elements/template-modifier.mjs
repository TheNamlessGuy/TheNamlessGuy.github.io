import { genericStylesheet } from '../../../generic-stylesheet.mjs';
import { CustomTabsElement } from '../../../custom-elements/tabs.mjs';
import { CustomAccordionElement } from '../../../custom-elements/accordion.mjs';
import { CustomSeparatorElement } from '../../../custom-elements/separator.mjs';

/** @import { TemplateConfigModifier } from '../templates.mjs'; */
/** @import { ImageRenderModifier } from '../render.mjs'; */

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
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
`);

export class CustomTemplateModifierElement extends HTMLElement {
  static _EMPTY_IMAGE_DATA_URL = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>`;

  static _TEXT_IDX = 0;
  static _IMAGE_IDX = 1;

  /** @param {TemplateConfigModifier} modifier */
  constructor(modifier) {
    super();

    this._modifier = modifier;

    const container = document.createElement('div');

    const title = document.createElement('div');
    title.textContent = this._modifier.title;
    title.classList.add('mt5p', 'mb5p', 'text-left', 'bold');
    container.append(title);

    this._elements.tabs = new CustomTabsElement();

    {
      this._elements.text.container = document.createElement('div');
      this._elements.tabs.addTab('text', 'Text', [this._elements.text.container]);

      this._elements.text.field = document.createElement('textarea');
      this._elements.text.field.placeholder = `'${this._modifier.title}' text`;
      this._elements.text.field.classList.add('faded');
      this._elements.text.container.append(this._elements.text.field);

      this._elements.text.container.append(new CustomSeparatorElement({size: 'small', intensity: 'faded'}));

      const advancedOptions = new CustomAccordionElement({intensity: 'faded'});
      advancedOptions.addSection('advanced-options', 'Advanced options', [document.createTextNode('Coming soon!')]);
      this._elements.text.container.append(advancedOptions);
    }

    {
      this._elements.image.container = document.createElement('div');
      this._elements.tabs.addTab('image', 'Image', [this._elements.image.container]);

      this._elements.image.input = document.createElement('input');
      this._elements.image.input.type = 'file';
      this._elements.image.input.accept = 'image/jpeg,image/png';
      this._elements.image.input.classList.add('faded');
      this._elements.image.input.addEventListener('change', () => this._onImageUploaded());
      this._elements.image.container.append(this._elements.image.input);

      this._elements.image.container.append(new CustomSeparatorElement({size: 'small', intensity: 'faded'}));

      const advancedOptions = new CustomAccordionElement({intensity: 'faded'});
      advancedOptions.addSection('advanced-options', 'Advanced options', [document.createTextNode('Coming soon!')]);
      this._elements.image.container.append(advancedOptions);
    }

    this._elements.tabs.select(this._modifier.example.type);
    container.append(this._elements.tabs);

    // TODO: Advanced options

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.adoptedStyleSheets = [genericStylesheet, stylesheet];
    shadow.append(container);
  }

  get type() {
    return /** @type {'image'|'text'} */ (this._elements.tabs.getCurrentTab());
  }

  /** @returns {ImageRenderModifier} */
  getModifier() {
    if (this.type === 'image') {
      return {
        type: 'image',

        x: this._modifier.x,
        y: this._modifier.y,
        w: this._modifier.w,
        h: this._modifier.h,

        path: this._uploadedImageURL ?? CustomTemplateModifierElement._EMPTY_IMAGE_DATA_URL,

        fittingType: this._modifier.defaults.image.fittingType,
        opacity: 1,
      };
    } else if (this.type === 'text') {
      return {
        type: 'text',

        x: this._modifier.x,
        y: this._modifier.y,
        w: this._modifier.w,
        h: this._modifier.h,

        text: this._elements.text.field.value,

        color: this._modifier.defaults.text.color,
        background: this._modifier.defaults.text.background ?? null,
      };
    } else {
      throw new Error(`Unknown type '${this.type}'`);
    }
  }

  /** @type {TemplateConfigModifier} */
  _modifier = null;

  /** @type {string|null} */
  _uploadedImageURL = null;

  _elements = {
    /** @type {CustomTabsElement} */
    tabs: null,

    image: {
      /** @type {HTMLDivElement} */
      container: null,
      /** @type {HTMLInputElement} */
      input: null,
    },
    text: {
      /** @type {HTMLDivElement} */
      container: null,
      /** @type {HTMLTextAreaElement} */
      field: null,
    }
  };

  _onImageUploaded() {
    const files = this._elements.image.input.files;
    if (files == null || files.length === 0 || files[0] == null) {
      this._uploadedImageURL = null;
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this._uploadedImageURL = /** @type {string} */ (reader.result);
    });

    reader.readAsDataURL(files[0]);
  }
}

onDOMContentLoaded(() => customElements.define('c-template-modifier', CustomTemplateModifierElement));
