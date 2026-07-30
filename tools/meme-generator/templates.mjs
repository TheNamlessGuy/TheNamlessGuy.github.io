import { CustomSelectElement } from '../../custom-elements/select.mjs';
import { CustomSeparatorElement } from '../../custom-elements/separator.mjs';
import { empty } from '../../helpers.mjs';
import { CustomTemplateModifierElement } from './custom-elements/template-modifier.mjs';
import { Render } from './render.mjs';

/** @import {FittingType} from './index.mjs' */
/** @import {ImageRenderModifier, ImageRenderModifier_Image, ImageRenderModifier_Text} from './render.mjs' */

/** OriginPosition
 * @typedef {'top-left'|'bottom-left'|'bottom-right'|'top-right'} OriginPosition
 */

/** TemplateConfig
 * @typedef {object} TemplateConfig
 *
 * @property {string} id The ID to the config
 * @property {string} title The title of the config
 *
 * @property {[ForcedImageTemplateConfigModifier, ...TemplateConfigModifier[]]} modifiers The first modifier MUST be a ForcedImageTemplateConfigModifier, to establish the width and height of the canvas
 */

/** TemplateConfigModifier
 * @typedef {ForcedImageTemplateConfigModifier|VariableTypeTemplateConfigModifier} TemplateConfigModifier
 */

/** TemplateConfigModifierExample
 * @typedef {TemplateConfigModifierExample_Image|TemplateConfigModifierExample_Text} TemplateConfigModifierExample
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

/** TemplateConfigModifierRenderBox
 * @typedef {object} TemplateConfigModifierRenderBox
 *
 * @property {'light'|'dark'} [skin]
 * @property {string} [backgroundColor]
 * @property {string} [textColor]
 * @property {string} [borderColor]
 */

/** TemplateConfigModifierDefaults
 * @typedef {object} TemplateConfigModifierDefaults
 *
 * @property {TemplateConfigModifierDefaultsImage} image
 * @property {TemplateConfigModifierDefaultsText} text
 */
/** TemplateConfigModifierDefaultsImage
 * @typedef {object} TemplateConfigModifierDefaultsImage
 *
 * @property {FittingType} fittingType
 * @property {OriginPosition} [origin]
 */
/** TemplateConfigModifierDefaultsText
 * @typedef {object} TemplateConfigModifierDefaultsText
 *
 * @property {string} textColor
 * @property {string} [backgroundColor]
 * @property {OriginPosition} [origin]
 */

/** VariableTypeTemplateConfigModifier
 * @typedef {object} VariableTypeTemplateConfigModifier
 *
 * @property {'variable-type'} type
 *
 * @property {string} title
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 *
 * @property {TemplateConfigModifierRenderBox} [renderBox]
 * @property {TemplateConfigModifierDefaults} defaults
 * @property {TemplateConfigModifierExample} example
 */

/** ForcedImageTemplateConfigModifier
 * @typedef {ForcedImageTemplateConfigModifier_Locked|ForcedImageTemplateConfigModifier_Unlocked} ForcedImageTemplateConfigModifier
 */
/** ForcedImageTemplateConfigModifier_Locked
 * @typedef {object} ForcedImageTemplateConfigModifier_Locked
 *
 * @property {'image'} type
 *
 * @property {true} locked
 * @property {number} x
 * @property {number} y
 * @property {number|'image'} w
 * @property {number|'image'} h
 *
 * @property {string} path
 *
 * @property {TemplateConfigModifierDefaultsImage} defaults
 */
/** ForcedImageTemplateConfigModifier_Unlocked
 * @typedef {object} ForcedImageTemplateConfigModifier_Unlocked
 *
 * @property {'image'} type
 *
 * @property {string} title
 * @property {false} locked
 * @property {number} x
 * @property {number} y
 * @property {number|'image'} w
 * @property {number|'image'} h
 *
 * @property {TemplateConfigModifierRenderBox} [renderBox]
 * @property {TemplateConfigModifierDefaultsImage} defaults
 * @property {TemplateConfigModifierExample_Image} example
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

  initialize() {
    const select = Templates._elements.select();
    for (const template of Templates._availableTemplates) {
      select.addOption({id: template.id, display: template.title});
    }

    select.addEventListener('change', () => Templates.select(select.value));
    select.addEventListener('change', this._onSelectionChange.bind(this));

    select.value = QueryParameters.get('template') ?? select.value;
  },

  /** @param {string} id */
  select(id) {
    const template = Templates.get(id);

    void Templates._example.render(template);

    const container = Templates._elements.modifierContainer();
    empty(container);

    /**
     * @param {TemplateConfigModifier} modifier
     * @returns {modifier is (ForcedImageTemplateConfigModifier_Unlocked|VariableTypeTemplateConfigModifier)}
     */
    const filter = (modifier) => !(modifier.type === 'image' && modifier.locked);
    const modifiers = template.modifiers.filter(filter);
    for (let m = 0; m < modifiers.length; ++m) {
      if (m > 0) { container.append(new CustomSeparatorElement({size: 'medium', intensity: 'faded'})); }

      container.append(new CustomTemplateModifierElement(modifiers[m]));
    }
  },

  current: {
    getID() {
      return Templates._elements.select().value;
    },

    get() {
      return Templates.get(Templates.current.getID());
    },

    async render() {
      Render.empty();
      await Render.image(Templates.current._getCurrentModifiers());
    },

    /**
     * @returns {[ImageRenderModifier_Image, ...ImageRenderModifier[]]}
     */
    _getCurrentModifiers() {
      const template = Templates.current.get();
      const elements = Templates._elements.modifiers();

      /** @type {ImageRenderModifier[]} */
      const retval = [];

      // For each modifier that ISN'T ForcedImageTemplateConfigModifier_Locked, get the element modifier.
      // Since ForcedImageTemplateConfigModifier_Locked aren't spawned as elements, handle those manually.
      // Make sure everything ends up in retval in the config order.

      let t = 0;
      let e = 0;
      for (; t < template.modifiers.length; ++t) {
        const modifier = template.modifiers[t];
        if (modifier.type === 'image' && modifier.locked) {
          retval.push({
            type: 'image',

            x: modifier.x,
            y: modifier.y,
            w: modifier.w,
            h: modifier.h,
            origin: modifier.defaults.origin,

            path: modifier.path,

            fittingType: modifier.defaults.fittingType,
            opacity: 1,
          });
        } else {
          retval.push(elements[e].getModifier());
          e += 1;
        }
      }

      const [firstModifier, ...otherModifiers] = retval;
      return [
        /** @type {ImageRenderModifier_Image} */ (firstModifier),
        ...otherModifiers,
      ];
    },
  },

  _example: {
    /**
     * @param {TemplateConfig} template
     * @returns {Promise<void>}
     */
    async render(template) {
      Render.empty();
      await Render.image(Templates._example._getExampleModifiers(template.modifiers));
    },

    /**
     * @param {[ForcedImageTemplateConfigModifier, ...TemplateConfigModifier[]]} modifiers
     * @returns {[ImageRenderModifier_Image, ...ImageRenderModifier[]]}
     */
    _getExampleModifiers(modifiers) {
      const [firstTemplateModifier, ...otherTemplateModifiers] = modifiers;
      const firstImageModifier = Templates._example._getExampleModifier(firstTemplateModifier);
      const otherImageModifiers = otherTemplateModifiers.map(Templates._example._getExampleModifier);
      return [firstImageModifier, ...otherImageModifiers];
    },

    /**
     * @overload
     * @param {ForcedImageTemplateConfigModifier} modifier
     * @returns {ImageRenderModifier_Image}
     */
    /**
     * @overload
     * @param {TemplateConfigModifier} modifier
     * @returns {ImageRenderModifier}
     */
    /**
     * @param {TemplateConfigModifier} modifier
     * @returns {ImageRenderModifier}
     */
    _getExampleModifier(modifier) {
      if (modifier.type === 'variable-type') {
        if (modifier.example.type === 'image') {
          return Templates._example._getExampleImageModifier(modifier, {
            path: modifier.example.path,
            fittingType: modifier.defaults.image.fittingType,
            origin: modifier.defaults.image.origin,
          });
        } else if (modifier.example.type === 'text') {
          return Templates._example._getExampleTextModifier(modifier, {
            value: modifier.example.value,
            color: modifier.defaults.text.textColor,
            background: modifier.defaults.text.backgroundColor,
            origin: modifier.defaults.text.origin,
          });
        }

        // @ts-ignore `Property 'type' does not exist on type 'never'.`
        throw new Error(`Unknown 'variable-type' modifier type '${modifier.example.type}'`);
      } else if (modifier.type === 'image') {
        if (modifier.locked) {
          return Templates._example._getExampleImageModifier(modifier, {
            path: modifier.path,
            fittingType: modifier.defaults.fittingType,
            origin: modifier.defaults.origin,
          });
        }

        return Templates._example._getExampleImageModifier(modifier, {
          path: modifier.example.path,
          fittingType: modifier.defaults.fittingType,
            origin: modifier.defaults.origin,
        });
      }

      // @ts-ignore `Property 'type' does not exist on type 'never'.`
      throw new Error(`Unknown modifier type '${modifier.type}'`);
    },

    /**
     * @param {TemplateConfigModifier} modifier
     * @param {object} data
     * @param {string} data.path
     * @param {FittingType} data.fittingType
     * @param {OriginPosition|null|undefined} data.origin
     * @returns {ImageRenderModifier_Image}
     */
    _getExampleImageModifier(modifier, data) {
      return {
        type: 'image',

        x: modifier.x,
        y: modifier.y,
        w: modifier.w,
        h: modifier.h,
        origin: data.origin,

        path: data.path,

        fittingType: data.fittingType,
        opacity: 1,
      };
    },

    /**
     * @param {VariableTypeTemplateConfigModifier} modifier
     * @param {object} data
     * @param {string} data.value
     * @param {string} data.color
     * @param {string|null|undefined} data.background
     * @param {OriginPosition|null|undefined} data.origin
     * @returns {ImageRenderModifier_Text}
     */
    _getExampleTextModifier(modifier, data) {
      return {
          type: 'text',

          x: modifier.x,
          y: modifier.y,
          w: modifier.w,
          h: modifier.h,

          text: data.value,

          color: data.color,
          background: data.background ?? null,
      };
    },
  },

  _onSelectionChange() {
    QueryParameters.set('template', Templates._elements.select().value);
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
