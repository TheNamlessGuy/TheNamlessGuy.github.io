import { CustomSelectElement } from '../../custom-elements/select.mjs';
import { CustomSeparatorElement } from '../../custom-elements/separator.mjs';
import { empty, FileSystem } from '../../helpers.mjs';
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
 * @property {string} saveFileNameTemplate The template to use when generating the file name to save as. See Templates.current.filename()
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

    /** @returns {string} */
    filename() {
      const template = Templates.current.get();

      let filename = template.saveFileNameTemplate;

      /**
       * @param {number} i
       * @param {string} replacement
       */
      const replace = (i, replacement) => {
        replacement = (replacement === '') ? 'nothing' : replacement;
        filename = filename.replace(`{${i}}`, replacement);
      };

      Templates.current._foreachTemplateModifier((data) => {
        if (data.modifier instanceof CustomTemplateModifierElement) {
          if (data.modifier.type === 'image') {
            const {filename, extension} = FileSystem.filenameAndExtension(data.modifier.uploadedImageName ?? '');
            replace(data.idx, filename);
          } else if (data.modifier.type === 'text') {
            replace(data.idx, data.modifier.textValue);
          } else {
            throw new Error(`Unknown type '${data.modifier.type}'`);
          }
        } else {
          const {filename, extension} = FileSystem.filenameAndExtension(data.modifier.path);
          replace(data.idx, filename);
        }
      });

      return filename;
    },

    userCustomModifier: {
      add() {
        const container = Templates._elements.modifierContainer();
        const currentCount = Templates._elements.modifiers().filter((element) => element.isCustom()).length;
        container.append(new CustomSeparatorElement({size: 'medium', intensity: 'faded'}));
        container.append(new CustomTemplateModifierElement({
          type: 'variable-type',
          custom: true,

          title: `Custom ${currentCount + 1}`, // TODO
          x: 0,
          y: 0,
          w: 1,
          h: 1,

          defaults: {
            image: {
              fittingType: 'contain',
            },
            text: {
              textColor: 'black',
            },
          },

          example: {
            type: 'text',
            value: '',
          },
        }));
      },

      /** @param {CustomTemplateModifierElement} modifier */
      remove(modifier) {
        const container = Templates._elements.modifierContainer();
        const children = Array.from(container.children);
        const idx = children.indexOf(modifier);
        if (children[idx - 1] instanceof CustomSeparatorElement) {
          children[idx - 1].remove();
        }
        modifier.remove();
      },
    },

    /**
     * @returns {[ImageRenderModifier_Image, ...ImageRenderModifier[]]}
     */
    _getCurrentModifiers() {
      /** @type {ImageRenderModifier[]} */
      const retval = [];
      Templates.current._foreachTemplateModifier((data) => {
        if (data.modifier instanceof CustomTemplateModifierElement) {
          retval.push(data.modifier.getModifier());
        } else {
          retval.push({
            type: 'image',

            x: data.modifier.x,
            y: data.modifier.y,
            w: data.modifier.w,
            h: data.modifier.h,
            origin: data.modifier.defaults.origin,

            path: data.modifier.path,

            fittingType: data.modifier.defaults.fittingType,
            opacity: 1,
          });
        }
      });

      const [firstModifier, ...otherModifiers] = retval;
      return [
        /** @type {ImageRenderModifier_Image} */ (firstModifier),
        ...otherModifiers,
      ];
    },

    /**
     * Handles the fact that:
     * 1) ForcedImageTemplateConfigModifier_Locked from a template don't get a CustomTemplateModifierElement
     * 2) You can add custom modifiers
     * and iterates over all relevant template modifiers, in the order you'd expect
     *
     * @param {(data: {idx: number, modifier: ForcedImageTemplateConfigModifier_Locked | CustomTemplateModifierElement}) => void} callback
     */
    _foreachTemplateModifier(callback) {
      const template = Templates.current.get();
      const elements = Templates._elements.modifiers();

      let t = 0;
      let e = 0;
      while (t < template.modifiers.length || e < elements.length) {
        let foundLockedImageTemplate = false;

        if (t < template.modifiers.length) {
          // If the current template modifier is a ForcedImageTemplateConfigModifier_Locked, use that
          const modifier = template.modifiers[t];
          if (modifier.type === 'image' && modifier.locked) {
            foundLockedImageTemplate = true;
            callback({modifier: modifier, idx: t});
          }
        }

        if (!foundLockedImageTemplate && e < elements.length) {
          callback({modifier: elements[e], idx: t});
          e += 1;
        }

        t += 1;
      }
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
