/**
 * @param {string} value
 * @returns {boolean}
 */
export function stringIsNumeric(value) {
  // https://stackoverflow.com/a/175787
  return (typeof value === 'string') && !isNaN(value) && !isNaN(parseFloat(value));
}

export const Elements = {
  /**
   * @param {object} options
   * @param {string} options.label
   * @param {'primary'|'faded'} [options.intensity]
   * @param {string[]} [options.classes]
   * @returns {HTMLFieldSetElement}
   */
  fieldset(options) {
    const fieldset = document.createElement('fieldset');
    fieldset.classList.add(...(options.classes ?? []));
    if (options.intensity === 'faded') {
      fieldset.classList.add('faded');
    }

    const legend = document.createElement('legend');
    legend.textContent = options.label;
    fieldset.append(legend);

    return fieldset;
  },
};
