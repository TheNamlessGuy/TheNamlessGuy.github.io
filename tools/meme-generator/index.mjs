import { Templates } from './templates.mjs';

import './templates/drake-hotline-bling/config.mjs';
import './templates/nervous-dog/config.mjs';
import './templates/wow-cool-robot/config.mjs';

/** FittingType
 * @typedef {'stretch'|'crop'|'contain'} FittingType
 *
 * 'stretch' = Stretch the image to fit the box perfectly
 * 'contain' = Render the image with the same proportions, within the box
 * 'crop' = Render the original image in full size, cropping it to fit the box
 */

onDOMContentLoaded(() => {
  Templates.initialize();

  const generateBtn = /** @type {HTMLButtonElement} */ (document.getElementById('generate'));
  generateBtn.addEventListener('click', () => Templates.current.render());
});
