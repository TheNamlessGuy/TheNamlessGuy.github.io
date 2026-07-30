import { genericStylesheet } from '../../../generic-stylesheet.mjs';
import { CustomTabsElement } from '../../../custom-elements/tabs.mjs';
import { CustomAccordionElement } from '../../../custom-elements/accordion.mjs';
import { CustomSeparatorElement } from '../../../custom-elements/separator.mjs';
import { CustomToggleElement } from '../../../custom-elements/toggle.mjs';
import { CustomNumberInputElement } from '../../../custom-elements/number-input.mjs';
import { CustomColorPickerElement } from '../../../custom-elements/color-picker.mjs';
import { Elements } from '../../../helpers.mjs';

/** @import { ForcedImageTemplateConfigModifier_Unlocked, VariableTypeTemplateConfigModifier } from '../templates.mjs'; */
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

  /** @param {VariableTypeTemplateConfigModifier|ForcedImageTemplateConfigModifier_Unlocked} modifier */
  constructor(modifier) {
    super();

    this._modifier = modifier;

    const container = document.createElement('div');

    const title = document.createElement('div');
    title.textContent = this._modifier.title;
    title.classList.add('mt5p', 'mb5p', 'text-left', 'bold');
    container.append(title);

    this._elements.tabs = new CustomTabsElement();

    { // Text tab
      this._elements.text.container = document.createElement('div');
      this._elements.tabs.addTab('text', 'Text', [this._elements.text.container]);

      if (this._modifier.type !== 'variable-type') {
        this._elements.tabs.disableTab('text', {tooltip: 'This field can only be an image'});
      } else {
        this._elements.text.field = document.createElement('textarea');
        this._elements.text.field.placeholder = `'${this._modifier.title}' text`;
        this._elements.text.field.classList.add('faded');
        this._elements.text.container.append(this._elements.text.field);

        this._elements.text.container.append(new CustomSeparatorElement({size: 'small', intensity: 'faded'}));

        const advancedOptionsContainer = document.createElement('div');
        advancedOptionsContainer.classList.add('text-left');

        this._elements.text.color = new CustomColorPickerElement({
          label: 'Text color:',
          value: this._modifier.defaults.text.textColor,
          intensity: 'faded',
          size: 'small',
        });
        advancedOptionsContainer.append(this._elements.text.color);

        const boundingBoxContainer = Elements.fieldset({label: 'Bounding box', intensity: 'faded', classes: ['mt5p']});
        advancedOptionsContainer.append(boundingBoxContainer);

        this._elements.text.renderBox = new CustomToggleElement({
          leftLabel: 'Display:',
          checked: false,
          size: 'small',
          intensity: 'faded',
        });
        boundingBoxContainer.append(this._elements.text.renderBox);

        boundingBoxContainer.append(new CustomSeparatorElement({size: 'small', intensity: 'faded'}));

        this._elements.text.x = new CustomNumberInputElement({
          label: 'x:',
          value: this._modifier.x,
          defaultValue: this._modifier.x,
          min: 0,
          intensity: 'faded',
        });
        boundingBoxContainer.append(this._elements.text.x);

        this._elements.text.y = new CustomNumberInputElement({
          label: 'y:',
          value: this._modifier.y,
          defaultValue: this._modifier.y,
          min: 0,
          intensity: 'faded',
        });
        boundingBoxContainer.append(this._elements.text.y);

        this._elements.text.w = new CustomNumberInputElement({
          label: 'w:',
          value: this._modifier.w,
          defaultValue: this._modifier.w,
          min: 0,
          intensity: 'faded',
        });
        boundingBoxContainer.append(this._elements.text.w);

        this._elements.text.h = new CustomNumberInputElement({
          label: 'h:',
          value: this._modifier.h,
          defaultValue: this._modifier.h,
          min: 0,
          intensity: 'faded',
        });
        boundingBoxContainer.append(this._elements.text.h);

        const advancedOptionsAccordion = new CustomAccordionElement({intensity: 'faded'});
        advancedOptionsAccordion.addSection('advanced-options', 'Advanced options', [advancedOptionsContainer]);
        this._elements.text.container.append(advancedOptionsAccordion);
      }
    }

    { // Image tab
      this._elements.image.container = document.createElement('div');
      this._elements.tabs.addTab('image', 'Image', [this._elements.image.container]);

      this._elements.image.input = document.createElement('input');
      this._elements.image.input.type = 'file';
      this._elements.image.input.accept = 'image/jpeg,image/png';
      this._elements.image.input.classList.add('faded');
      this._elements.image.input.addEventListener('change', () => this._onImageUploaded());
      this._elements.image.container.append(this._elements.image.input);

      this._elements.image.container.append(new CustomSeparatorElement({size: 'small', intensity: 'faded'}));

      const advancedOptionsContainer = document.createElement('div');
      advancedOptionsContainer.classList.add('text-left');

      const boundingBoxContainer = Elements.fieldset({label: 'Bounding box', intensity: 'faded'});
      advancedOptionsContainer.append(boundingBoxContainer);

      this._elements.image.renderBox = new CustomToggleElement({
        leftLabel: 'Display:',
        checked: false,
        size: 'small',
        intensity: 'faded',
      });
      boundingBoxContainer.append(this._elements.image.renderBox);

      boundingBoxContainer.append(new CustomSeparatorElement({size: 'small', intensity: 'faded'}));

      this._elements.image.x = new CustomNumberInputElement({
        label: 'x:',
        value: this._modifier.x,
        defaultValue: this._modifier.x,
        min: 0,
        intensity: 'faded',
      });
      boundingBoxContainer.append(this._elements.image.x);

      this._elements.image.y = new CustomNumberInputElement({
        label: 'y:',
        value: this._modifier.y,
        defaultValue: this._modifier.y,
        min: 0,
        intensity: 'faded',
      });
      boundingBoxContainer.append(this._elements.image.y);

      this._elements.image.w = new CustomNumberInputElement({
        label: 'w:',
        value: this._modifier.w === 'image' ? null : this._modifier.w,
        defaultValue: this._modifier.w === 'image' ? null : this._modifier.w,
        min: 0,
        intensity: 'faded',
        disabled: this._modifier.w === 'image',
        tooltip: this._modifier.w === 'image' ? 'This will automatically be set to the width of the uploaded image' : '',
      });
      boundingBoxContainer.append(this._elements.image.w);

      this._elements.image.h = new CustomNumberInputElement({
        label: 'h:',
        value: this._modifier.h === 'image' ? null : this._modifier.h,
        defaultValue: this._modifier.h === 'image' ? null : this._modifier.h,
        min: 0,
        intensity: 'faded',
        disabled: this._modifier.h === 'image',
        tooltip: this._modifier.h === 'image' ? 'This will automatically be set to the height of the uploaded image' : '',
      });
      boundingBoxContainer.append(this._elements.image.h);

      const advancedOptions = new CustomAccordionElement({intensity: 'faded'});
      advancedOptions.addSection('advanced-options', 'Advanced options', [advancedOptionsContainer]);
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
      const defaults = (this._modifier.type === 'image') ? {
        fittingType: this._modifier.defaults.fittingType,
        origin: this._modifier.defaults.origin,
      } : {
        fittingType: this._modifier.defaults.image.fittingType,
        origin: this._modifier.defaults.image.origin,
      };

      const w = (this._modifier.w === 'image') ? 'image' : this._elements.image.w.value;
      const h = (this._modifier.h === 'image') ? 'image' : this._elements.image.h.value;

      return {
        type: 'image',

        x: this._elements.image.x.value ?? this._modifier.x,
        y: this._elements.image.y.value ?? this._modifier.y,
        w: w ?? this._modifier.w,
        h: h ?? this._modifier.h,
        origin: defaults.origin,

        path: this._uploadedImageURL ?? CustomTemplateModifierElement._EMPTY_IMAGE_DATA_URL,

        fittingType: defaults.fittingType,
        opacity: 1,

        renderBox: {
          render: this._elements.image.renderBox.checked,
          text: `'${this._modifier.title}' image`,
          skin: this._modifier.renderBox?.skin ?? null,
          background: this._modifier.renderBox?.backgroundColor ?? null,
          color: this._modifier.renderBox?.textColor ?? null,
        },
      };
    } else if (this.type === 'text') {
      const modifier = /** @type {VariableTypeTemplateConfigModifier} */ (this._modifier);
      return {
        type: 'text',

        x: this._elements.text.x.value ?? modifier.x,
        y: this._elements.text.y.value ?? modifier.y,
        w: this._elements.text.w.value ?? modifier.w,
        h: this._elements.text.h.value ?? modifier.h,
        origin: modifier.defaults.text.origin,

        text: this._elements.text.field.value,

        color: this._elements.text.color.value ?? modifier.defaults.text.textColor,
        background: modifier.defaults.text.backgroundColor ?? null,

        renderBox: {
          render: this._elements.text.renderBox.checked,
          text: `'${modifier.title}' text`,
          skin: modifier.renderBox?.skin ?? null,
          background: modifier.renderBox?.backgroundColor ?? null,
          color: modifier.renderBox?.textColor ?? null,
        },
      };
    } else {
      throw new Error(`Unknown type '${this.type}'`);
    }
  }

  /** @type {VariableTypeTemplateConfigModifier|ForcedImageTemplateConfigModifier_Unlocked} */
  _modifier;

  /** @type {string|null} */
  _uploadedImageURL = null;

  _elements = {
    /** @type {CustomTabsElement} */
    // @ts-ignore `Type 'null' is not assignable to type 'CustomTabsElement'`
    tabs: null,

    image: {
      /** @type {HTMLDivElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'HTMLDivElement'`
      container: null,
      /** @type {HTMLInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'HTMLInputElement'`
      input: null,
      /** @type {CustomToggleElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomToggleElement'`
      renderBox: null,
      /** @type {CustomNumberInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomNumberInputElement'`
      x: null,
      /** @type {CustomNumberInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomNumberInputElement'`
      y: null,
      /** @type {CustomNumberInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomNumberInputElement'`
      w: null,
      /** @type {CustomNumberInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomNumberInputElement'`
      h: null,
    },
    text: {
      /** @type {HTMLDivElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'HTMLDivElement'`
      container: null,
      /** @type {HTMLTextAreaElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'HTMLTextAreaElement'`
      field: null,
      /** @type {CustomColorPickerElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomColorPickerElement'`
      color: null,
      /** @type {CustomToggleElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomToggleElement'`
      renderBox: null,
      /** @type {CustomNumberInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomNumberInputElement'`
      x: null,
      /** @type {CustomNumberInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomNumberInputElement'`
      y: null,
      /** @type {CustomNumberInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomNumberInputElement'`
      w: null,
      /** @type {CustomNumberInputElement} */
      // @ts-ignore `Type 'null' is not assignable to type 'CustomNumberInputElement'`
      h: null,
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
