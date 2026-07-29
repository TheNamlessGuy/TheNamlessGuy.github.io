/** @import {FittingType} from './index.mjs' */

/** ImageRenderModifier_Image
 * @typedef {object} ImageRenderModifier_Image
 *
 * @property {'image'} type
 *
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 *
 * @property {string} path
 *
 * @property {FittingType} fittingType
 * @property {number} opacity
 *
 * @property {object} [renderBox]
 * @property {boolean} renderBox.render
 * @property {string} renderBox.text
 * @property {'light'|'dark'|null} [renderBox.skin]
 * @property {string|null} [renderBox.background]
 * @property {string|null} [renderBox.color]
 * @property {string|null} [renderBox.border]
 */
/** ImageRenderModifier_Text
 * @typedef {object} ImageRenderModifier_Text
 *
 * @property {'text'} type
 *
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 *
 * @property {string} text
 *
 * @property {string} color
 * @property {string|null} [background]
 *
 * @property {object|null} [font]
 * @property {string|null} [font.family]
 * @property {string|null} [font.weight]
 * @property {object|null} [font.size]
 * @property {number|null} [font.size.min]
 * @property {number|null} [font.size.max]
 *
 * @property {number|null} [lineHeight]
 *
 * @property {object|null} [alignment]
 * @property {'left'|'center'|'right'|null} [alignment.horizontal]
 * @property {'top'|'middle'|'bottom'|null} [alignment.vertical]
 *
 * @property {object} [renderBox]
 * @property {boolean} renderBox.render
 * @property {string} renderBox.text
 * @property {'light'|'dark'|null} [renderBox.skin]
 * @property {string|null} [renderBox.background]
 * @property {string|null} [renderBox.color]
 * @property {string|null} [renderBox.border]
 */
/** ImageRenderModifier
 * @typedef {ImageRenderModifier_Image|ImageRenderModifier_Text} ImageRenderModifier
 */

/** ImageRenderOptions
 * @typedef {object} ImageRenderOptions
 *
 * @property {number} [forcedWidth]
 * @property {number} [forcedHeight]
 * @property {FittingType} [forcedBackgroundFittingType]
 */

export const Render = {
  empty() {
    const canvas = Render._canvas();
    const g = Render._g(canvas);

    g.fillStyle = '#000';
    g.fillRect(0, 0, canvas.width, canvas.height);
  },

  /**
   * @param {{path: string, render: 'first'|'last'}} template
   * @param {ImageRenderModifier[]} modifiers
   * @param {ImageRenderOptions} options
   * @returns {Promise<void>}
   */
  async image(template, modifiers, options) {
    const templateImage = await Render._loadImage(template.path);

    const canvas = Render._canvas();
    canvas.width = options.forcedWidth ?? templateImage.naturalWidth;
    canvas.height = options.forcedHeight ?? templateImage.naturalHeight;

    const g = Render._g(canvas);
    if (template.render === 'first') {
      Render._drawTemplateImage(canvas, g, templateImage);
    }

    for (const modifier of modifiers) {
      if (modifier.type === 'image') {
        const image = await Render._loadImage(modifier.path);

        g.save();
        g.globalAlpha = modifier.opacity;
        g.beginPath();
        g.rect(modifier.x, modifier.y, modifier.w, modifier.h);
        g.clip(); // Make sure things aren't rendered outside the given box

        Render._drawFittedImage(g, image, modifier);

        g.restore();
      } else if (modifier.type === 'text') {
        Render._drawFittedText(g, modifier.text, modifier);
      } else {
        throw new Error(`Unknown modifier type '${modifier.type}'`);
      }

      if (modifier.renderBox?.render) {
        Render._boxWithText(g, modifier);
      }
    }

    if (template.render === 'last') {
      Render._drawTemplateImage(canvas, g, templateImage);
    }
  },

  _canvas() {
    return /** @type {HTMLCanvasElement} */ (document.getElementById('current-image'));
  },

  /**
   * @param {HTMLCanvasElement|null} canvas
   * @returns {CanvasRenderingContext2D}
   */
  _g(canvas = null) {
    return /** @type {CanvasRenderingContext2D} */ ((canvas ?? Render._canvas()).getContext('2d'));
  },

  /**
   * @param {string} path
   * @returns {Promise<HTMLImageElement>}
   */
  async _loadImage(path) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error(`Failed to load image '${path}'`));
      image.src = path;
    });
    return image;
  },

  /**
   * @param {CanvasRenderingContext2D} g
   * @param {HTMLImageElement} image
   * @param {{x: number, y: number, w: number, h: number, fittingType: FittingType}} modifier
   */
  _drawFittedImage(g, image, modifier) {
    if (modifier.fittingType === 'stretch') {
      g.drawImage(image, modifier.x, modifier.y, modifier.w, modifier.h);
      return;
    }

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = modifier.w / modifier.h;

    if (modifier.fittingType === 'contain') {
      let w = modifier.w;
      let h = modifier.h;

      if (imageRatio > boxRatio) {
        // Image is proportionally wider than the box
        // Recalculate height to fit the proportion
        h = modifier.w / imageRatio;
      } else {
        // Image is proportionally taller than the box
        // Recalculate width to fit the proportion
        w = modifier.h * imageRatio;
      }

      const centerX = modifier.x + (modifier.w - w) / 2;
      const centerY = modifier.y + (modifier.h - h) / 2;

      g.drawImage(image, centerX, centerY, w, h);
      return;
    } else if (modifier.fittingType === 'crop') {
      let x = 0;
      let y = 0;
      let w = image.naturalWidth;
      let h = image.naturalHeight;

      if (imageRatio > boxRatio) {
        // Image is proportionally wider than the box
        // Crop left/right edges
        w = image.naturalHeight * boxRatio;
        x = (image.naturalWidth - w) / 2;
      } else {
        // Image is proportionally taller than the box
        // Crop top/bottom edges
        h = image.naturalWidth / boxRatio;
        y = (image.naturalHeight - h) / 2;
      }

      g.drawImage(image, x, y, w, h, modifier.x, modifier.y, modifier.w, modifier.h);
      return;
    }

    throw new Error(`Unknown fitting type '${modifier.fittingType}'`);
  },

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} g
   * @param {HTMLImageElement} image
   */
  _drawTemplateImage(canvas, g, image) {
    Render._drawFittedImage(g, image, {
      fittingType: 'stretch',

      x: 0,
      y: 0,
      w: canvas.width,
      h: canvas.height,
    });
  },

  /**
   * @param {CanvasRenderingContext2D} g
   * @param {string} text
   * @param {ImageRenderModifier_Text} modifier
   */
  _drawFittedText(g, text, modifier) {
    if (modifier.background != null) {
      g.fillStyle = modifier.background;
      g.fillRect(modifier.x, modifier.y, modifier.w, modifier.h);
    }

    modifier.font ??= {};
    modifier.font.family ??= 'Arial, sans-serif';
    modifier.font.weight ??= 'normal';

    modifier.font.size ??= {};
    modifier.font.size.min ??= 8;
    modifier.font.size.max ??= 72;

    modifier.lineHeight ??= 1.2;

    modifier.alignment ??= {};
    modifier.alignment.vertical ??= 'middle';
    modifier.alignment.horizontal ??= 'center';

    const fitted = Render._fitTextIntoBox(g, text, modifier.w, modifier.h, {
      fontFamily: modifier.font.family,
      fontWeight: modifier.font.weight,
      minFontSize: modifier.font.size.min,
      maxFontSize: modifier.font.size.max,
      lineHeight: modifier.lineHeight,
    });

    g.font = `${modifier.font.weight} ${fitted.fontSize}px ${modifier.font.family}`;
    g.fillStyle = modifier.color;
    g.globalAlpha = 1;
    g.textAlign = modifier.alignment.horizontal;
    g.textBaseline = 'top'; // This needs to be static for the calculations to work correctly

    const totalTextHeight = fitted.lines.length * fitted.lineHeight;

    let startX;
    if (modifier.alignment.horizontal === 'center') {
      startX = modifier.x + (modifier.w / 2);
    } else if (modifier.alignment.horizontal === 'right') {
      startX = modifier.x + modifier.w;
    } else { // textAlign === 'left' or faulty value
      startX = modifier.x;
    }

    let startY;
    if (modifier.alignment.vertical === 'middle') {
      startY = modifier.y + ((modifier.h - totalTextHeight) / 2);
    } else if (modifier.alignment.vertical === 'bottom') {
      startY = modifier.y + modifier.h - totalTextHeight;
    } else { // verticalAlign === 'top' or faulty value
      startY = modifier.y;
    }

    g.save();
    g.beginPath();
    g.rect(modifier.x, modifier.y, modifier.w, modifier.h);
    g.clip(); // Ensure we don't render outside the box

    fitted.lines.forEach((line, idx) => {
      g.fillText(line, startX, startY + (idx * fitted.lineHeight));
    });

    g.restore();
    g.globalAlpha = 1;
  },

  /**
   * Binary search of font sizes that will best fit the given box. Prefers no separated words.
   *
   * @param {CanvasRenderingContext2D} g
   * @param {string} text
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @param {{fontFamily: string, fontWeight: string, minFontSize: number, maxFontSize: number, lineHeight: number}} options
   * @returns {{fontSize: number, lines: string[], lineHeight: number}}
   */
  _fitTextIntoBox(g, text, maxWidth, maxHeight, options) {
    /**
     * @param {(data: {textHeight: number, separatedWord: boolean}) => boolean} isValid
     * @returns {{fontSize: number, lines: string[], lineHeight: number}|null}
     */
    const findLargest = (isValid) => {
      let low = options.minFontSize;
      let high = options.maxFontSize;

      /** @type {{fontSize: number, lines: string[], lineHeight: number, separatedWord: boolean}|null} */
      let best = null;

      while (low <= high) {
        const fontSize = Math.floor((low + high) / 2);

        g.font = `${options.fontWeight} ${fontSize}px ${options.fontFamily}`;

        const {lines, separatedWord} = Render._fitTextIntoWidth(g, text, maxWidth);

        const lineHeight = fontSize * options.lineHeight;
        const textHeight = Math.max(1, lines.length) * lineHeight;

        if (isValid({textHeight, separatedWord})) {
          best = {fontSize, lines, separatedWord, lineHeight};
          low = fontSize + 1;
        } else {
          high = fontSize - 1;
        }
      }

      return best;
    };

    const noSeparatedWords = findLargest((data) => data.textHeight <= maxHeight && !data.separatedWord);
    if (noSeparatedWords != null) {
      return {
        fontSize: noSeparatedWords.fontSize,
        lines: noSeparatedWords.lines,
        lineHeight: noSeparatedWords.lineHeight,
      };
    }

    const withSeparatedWords = findLargest((data) => data.textHeight <= maxHeight);
    if (withSeparatedWords != null) {
      return {
        fontSize: withSeparatedWords.fontSize,
        lines: withSeparatedWords.lines,
        lineHeight: withSeparatedWords.lineHeight,
      };
    }

    // Fall back to the smallest allowed font
    g.font = `${options.fontWeight} ${options.minFontSize}px ${options.fontFamily}`;
    return {
      fontSize: options.minFontSize,
      lines: Render._fitTextIntoWidth(g, text, maxWidth).lines,
      lineHeight: options.minFontSize * options.lineHeight,
    };
  },

  /**
   * @param {CanvasRenderingContext2D} g
   * @param {string} text
   * @param {number} maxWidth
   * @returns {{lines: string[], separatedWord: boolean}}
   */
  _fitTextIntoWidth(g, text, maxWidth) {
    const lines = [];
    let separatedWord = false;

    const paragraphs = text.split('\n');
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) {
        lines.push('');
        continue;
      }

      let currentLine = '';
      const words = paragraph.trim().split(/\s+/);
      for (const word of words) {
        const candidate = currentLine.length > 0 ? `${currentLine} ${word}` : word;
        if (g.measureText(candidate).width <= maxWidth) {
          currentLine = candidate;
          continue;
        }

        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = '';
        }

        if (g.measureText(word).width <= maxWidth) {
          currentLine = word;
          continue;
        }

        let chunk = '';
        for (const c of word) {
          const candidate = chunk + c;
          if (g.measureText(candidate).width <= maxWidth) {
            chunk = candidate;
            continue;
          }

          if (chunk.length > 0) {
            lines.push(chunk);
            separatedWord = true;
          }

          chunk = c;
        }

        currentLine = chunk;
      }

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
    }

    return {lines, separatedWord};
  },

  /**
   * @param {CanvasRenderingContext2D} g
   * @param {ImageRenderModifier} modifier
   */
  _boxWithText(g, modifier) {
    let color;
    if (modifier.renderBox?.color != null) {
      color = modifier.renderBox.color;
    } else {
      color = ((modifier.renderBox?.skin ?? 'light') === 'light') ? '#FFFFFF' : '#000000';
    }

    let background;
    if (modifier.renderBox?.background != null) {
      background = modifier.renderBox.background;
    } else {
      background = ((modifier.renderBox?.skin ?? 'light') === 'light') ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
    }

    let border;
    if (modifier.renderBox?.border != null) {
      border = modifier.renderBox.border;
    } else {
      border = ((modifier.renderBox?.skin ?? 'light') === 'light') ? '#FFFFFF' : '#000000';
    }

    Render._drawFittedText(g, modifier.renderBox?.text ?? '', {
      type: 'text',

      x: modifier.x,
      y: modifier.y,
      w: modifier.w,
      h: modifier.h,

      text: modifier.renderBox?.text ?? '',

      color: modifier.renderBox?.color ?? color,
      background: modifier.renderBox?.background ?? background,

      alignment: {
        horizontal: 'center',
        vertical: 'middle',
      },
    });

    g.strokeStyle = modifier.renderBox?.border ?? border;
    g.strokeRect(modifier.x, modifier.y, modifier.w, modifier.h);
  },
};
