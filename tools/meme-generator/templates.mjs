import { CustomSelectElement } from '../../custom-elements/select.mjs';
import { CustomSeparatorElement } from '../../custom-elements/separator.mjs';
import { CustomTemplateModifierElement } from './custom-elements/template-modifier.mjs';
import { Render } from './render.mjs';

/** @import {FittingType} from './index.mjs' */
/** @import {ImageRenderModifier_Image, ImageRenderModifier_Text} from './render.mjs' */

/** TemplateConfig
 * @typedef {object} TemplateConfig
 *
 * @property {string} id The ID to the config
 * @property {string} title The title of the config
 *
 * @property {object} template
 * @property {string} template.path The path to the template image
 * @property {'first'|'last'} template.render When to render the template
 *
 * @property {TemplateConfigModifier[]} modifiers
 */
/** TemplateConfigModifier
 * @typedef {object} TemplateConfigModifier
 *
 * @property {string} title
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 *
 * @property {object} [renderBox]
 * @property {'light'|'dark'} [renderBox.skin]
 * @property {string} [renderBox.background]
 * @property {string} [renderBox.color]
 * @property {string} [renderBox.border]
 *
 * @property {object} defaults
 *
 * @property {object} defaults.image
 * @property {FittingType} defaults.image.fittingType
 *
 * @property {object} defaults.text
 * @property {string} defaults.text.color
 * @property {string} [defaults.text.background]
 *
 * @property {TemplateConfigModifierExample_Image|TemplateConfigModifierExample_Text} example
 */
/** TemplateConfigModifierExample_Image
 * @typedef {object} TemplateConfigModifierExample_Image
 *
 * @property {'image'} type
 * @property {string} path
 */
/** TemplateConfigModifierExample_Text
 * @typedef {object} TemplateConfigModifierExample_Text
 *
 * @property {'text'} type
 * @property {string} value
 */

export const Templates = {
  /** @type {TemplateConfig[]} */
  _availableTemplates: [],

  /** @param {TemplateConfig} config */
  register(config) {
    Templates._availableTemplates.push(config);
  },

  /**
   * @param {string} id
   * @returns {TemplateConfig}
   */
  get(id) {
    for (const template of Templates._availableTemplates) {
      if (template.id === id) {
        return template;
      }
    }

    throw new Error(`Unknown template ID '${id}'`);
  },

  getCurrent() {
    return Templates.get(Templates._elements.select().value);
  },

  initialize() {
    const select = Templates._elements.select();
    for (const template of Templates._availableTemplates) {
      select.addOption({id: template.id, display: template.title});
    }

    select.addEventListener('change', () => Templates.select(select.value));

    Templates.select(select.value);
  },

  /** @param {string} id */
  select(id) {
    const template = Templates.get(id);

    void Templates._renderExample(template);

    const container = Templates._elements.modifierContainer();

    while (container.lastChild != null) {
      container.removeChild(container.lastChild);
    }

    const separator = () => {
      const elem = new CustomSeparatorElement();
      elem.size('medium');
      elem.intensity('faded');
      return elem;
    };

    for (let m = 0; m < template.modifiers.length; ++m) {
      if (m > 0) { container.append(separator()); }

      container.append(new CustomTemplateModifierElement(template.modifiers[m]));
    }
  },

  async renderCurrent() {
    Render.empty();

    const template = Templates.getCurrent();
    const modifiers = Templates._elements.modifiers().map((element) => element.getModifier());

    await Render.image(template.template, modifiers, {});
  },

  /**
   * @param {TemplateConfig} template
   * @returns {Promise<void>}
   */
  async _renderExample(template) {
    Render.empty();

    const modifiers = template.modifiers.map((modifier) => {
      if (modifier.example.type === 'image') {
        return /** @satisfies {ImageRenderModifier_Image} */ ({
          type: 'image',

          x: modifier.x,
          y: modifier.y,
          w: modifier.w,
          h: modifier.h,

          path: modifier.example.path,

          fittingType: modifier.defaults.image.fittingType,
          opacity: 1,
        });
      } else if (modifier.example.type === 'text') {
        return /** @satisfies {ImageRenderModifier_Text} */ ({
          type: 'text',

          x: modifier.x,
          y: modifier.y,
          w: modifier.w,
          h: modifier.h,

          text: modifier.example.value,

          color: modifier.defaults.text.color,
          background: modifier.defaults.text.background ?? null,
        });
      } else {
        throw new Error(`Unknown modifier type '${modifier.type}'`);
      }
    });

    await Render.image(template.template, modifiers, {});
  },

  _elements: {
    select() {
      return /** @type {CustomSelectElement} */ (document.getElementById('template-select'));
    },

    modifierContainer() {
      return /** @type {HTMLDivElement} */ (document.getElementById('modifier-container'));
    },

    modifiers() {
      return /** @type {CustomTemplateModifierElement[]} */ (Array.from(Templates._elements.modifierContainer().getElementsByTagName('c-template-modifier')));
    },
  },
};
