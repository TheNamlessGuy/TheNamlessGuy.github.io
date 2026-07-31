// TODO: Merge this file with generic.js once it becomes modularized

/**
 * @param {string} value
 * @returns {boolean}
 */
export function stringIsNumeric(value) {
  // https://stackoverflow.com/a/175787
  return (typeof value === 'string') && !isNaN(value) && !isNaN(parseFloat(value));
}

/**
 * @param {Element} element
 */
export function empty(element) {
  while (element.lastChild != null) {
    element.removeChild(element.lastChild);
  }
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

export const FileSystem = {
  /**
   * @param {object} data
   * @param {Blob} data.blob
   * @param {string} data.filename
   */
  save(data) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(data.blob);
    a.download = data.filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  /**
   * @param {string} path
   * @returns {string|null} The directory part of the given path, or null if it can't determine the directory part. The string will not contain the trailing slash
   */
  dirname(path) {
    const idx = path.lastIndexOf('/');
    return idx === -1 ? null : path.substring(0, idx);
  },

  /**
   * @param {string} path
   * @returns {string|null} The filename part of the given path, or null if it can't determine the filename part
   */
  basename(path) {
    const idx = path.lastIndexOf('/');
    return idx === -1 ? null : path.substring(idx + 1);
  },

  /**
   * @param {string} path
   * @returns {{filename: string, extension: string|null}} If no period exists in the given path, it return no extension (null). Neither string will contain the period.
   */
  filenameAndExtension(path) {
    const basename = FileSystem.basename(path) ?? path; // Assume the given path is a filename if it doesn't contain a path
    const idx = basename.lastIndexOf('.');
    if (idx === -1) {
      return {filename: path, extension: null};
    }

    return {filename: basename.substring(0, idx), extension: basename.substring(idx + 1)};
  },
};
