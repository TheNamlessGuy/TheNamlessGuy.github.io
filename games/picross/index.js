/**
 * TODO:
 * * Solve (Step and fully)
 * * Save function - hash?
 */

const ELEMENTS = {
  field: null,
  winnerDisplay: null,
  colHandling: null,
  rowHandling: null,

  btn: {
    reset: null,
  },

  difficulty: {
    range: {
      min: null,
      max: null,
    },
    combo: {
      max: null,
    },
  },

  CONTAINERS: {
    box: null,
    rowControls: null,
    colControls: null,
  },
}

const GRID_DISPLAY = {
  row: null,
  col: null,

  init: function() {
    GRID_DISPLAY.row = document.getElementById('grid-size-row');
    GRID_DISPLAY.row.addEventListener('blur', GRID_DISPLAY.onRowBlur);
    GRID_DISPLAY.row.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') { GRID_DISPLAY.onRowBlur(); }
    });

    GRID_DISPLAY.col = document.getElementById('grid-size-col');
    GRID_DISPLAY.col.addEventListener('blur', GRID_DISPLAY.onColBlur);
    GRID_DISPLAY.col.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') { GRID_DISPLAY.onColBlur(); }
    });
  },

  update: function() {
    GRID_DISPLAY.row.value = AMOUNT.row;
    GRID_DISPLAY.col.value = AMOUNT.col;
  },

  disable: function() {
    GRID_DISPLAY.row.disabled = true;
    GRID_DISPLAY.col.disabled = true;
  },

  enable: function() {
    GRID_DISPLAY.row.disabled = false;
    GRID_DISPLAY.col.disabled = false;
  },

  onRowBlur: function() {
    if (!Helpers.isNumber(GRID_DISPLAY.row.value)) {
      GRID_DISPLAY.update();
      return;
    }

    const value = parseInt(GRID_DISPLAY.row.value, 10);
    while (AMOUNT.row > value) { Row.remove(); }
    while (AMOUNT.row < value) { Row.add([0]); }
  },

  onColBlur: function() {
    if (!Helpers.isNumber(GRID_DISPLAY.col.value)) {
      GRID_DISPLAY.update();
      return;
    }

    const value = parseInt(GRID_DISPLAY.col.value, 10);
    while (AMOUNT.col > value) { Column.remove(); }
    while (AMOUNT.col < value) { Column.add([0]); }
  },
};

const AMOUNT = {
  row: 0,
  col: 0,
  rowDefault: 15,
  colDefault: 15,
};

const Template = {
  box: null,
  control: null,
  controlsContainer: null,

  init: function(template) {
    return template.content.firstElementChild.cloneNode(true);
  },
}

const Helpers = {
  END_TYPE: {
    COUNTABLE: 0,
    SKIPPABLE: 1,
  },

  calculateValues: function(boxes, isSelected, optional = {}) {
    const isEnd = optional.isEnd ?? ((x) => isSelected(x) ? null : Helpers.END_TYPE.COUNTABLE);
    const stopProcessing = optional.stopProcessing ?? ((x) => false);
    const addLast = optional.addLast ?? true;

    const values = [];
    let combo = 0;

    for (let b = 0; b < boxes.length; ++b) {
      if (stopProcessing(boxes[b])) {
        break;
      }

      const endType = isEnd(boxes[b]);
      if (endType != null) {
        if (endType === Helpers.END_TYPE.COUNTABLE && combo > 0) {
          values.push(combo);
        }
        combo = 0;
      } else if (isSelected(boxes[b])) {
        combo += 1;
      }
    }

    if (addLast && (combo > 0 || values.length === 0)) {
      values.push(combo);
    }

    return values;
  },

  checkForFinishedValues: function(classes) {
    if (!ELEMENTS.field.classList.contains('generated')) {
      return;
    }

    for (const c of classes) {
      Helpers._checkForFinishedValues(c);
    }

    Helpers._checkIfWon();
  },

  _checkForFinishedValues: function(c) {
    const controls = Array.from(document.querySelectorAll(`.controls-container.${c}`)).flatMap((x) => Array.from(x.getElementsByClassName('control')));
    const controlValues = controls.map((x) => parseInt(x.value, 10));
    let boxes = Array.from(document.querySelectorAll(`.box.${c}`));
    const boxValues = Helpers.calculateValues(boxes, (x) => x.classList.contains('ticked'));
    if (Helpers.equal.array(controlValues, boxValues)) {
      for (const control of controls) {
        Helpers._setControlFinished(control, boxValues);
      }

      return;
    } else {
      for (const control of controls) {
        Helpers._setControlFinished(control, boxValues, false);
      }
    }

    // Check for "anchored" sequences from the beginning
    let values = Helpers.calculateValues(boxes, (x) => x.classList.contains('ticked'), {
      stopProcessing: (x) => !x.classList.contains('ticked') && !x.classList.contains('unticked'),
      isEnd: (x) => x.classList.contains('ticked') ? null : (x.classList.contains('unticked') ? Helpers.END_TYPE.COUNTABLE : Helpers.END_TYPE.SKIPPABLE),
      addLast: false,
    });
    for (let i = 0; i < values.length && i < controlValues.length; ++i) {
      if (values[i] === controlValues[i]) {
        Helpers._setControlFinished(controls[i], boxValues);
      } else {
        break;
      }
    }

    // Check for "anchored" sequences from the end
    boxes = boxes.reverse();
    values = Helpers.calculateValues(boxes, (x) => x.classList.contains('ticked'), {
      stopProcessing: (x) => !x.classList.contains('ticked') && !x.classList.contains('unticked'),
      isEnd: (x) => x.classList.contains('ticked') ? null : (x.classList.contains('unticked') ? Helpers.END_TYPE.COUNTABLE : Helpers.END_TYPE.SKIPPABLE),
      addLast: false,
    });
    for (let i = 0, j = controlValues.length - 1; i < values.length, j > 0; ++i, --j) {
      if (values[i] === controlValues[j]) {
        Helpers._setControlFinished(controls[j], boxValues);
      } else {
        break;
      }
    }
  },

  _setControlFinished: function(control, values, isFinished = true) {
    control.classList.toggle('finished', isFinished);
    const container = control.parentNode;
    const controls = container.getElementsByClassName('control');
    const hasUnfinished = Array.from(controls).some((x) => !x.classList.contains('finished'));
    if (hasUnfinished || controls.length !== values.length) {
      container.classList.remove('finished');
    } else if (!hasUnfinished) {
      container.classList.add('finished');
    }
  },

  _checkIfWon: function() {
    const unsolved = document.querySelectorAll(`.controls-container:not(.finished)`);
    if (unsolved.length === 0) {
      ELEMENTS.winnerDisplay.classList.remove('hidden');

      ELEMENTS.colHandling.classList.remove('hidden');
      ELEMENTS.rowHandling.classList.remove('hidden');

      GRID_DISPLAY.enable();
    }
  },

  equal: {
    array: function(a, b) {
      if (a.length !== b.length) {
        return false;
      }

      for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
          return false;
        }
      }

      return true;
    },
  },

  swapTheme: function(isLight = null) {
    if (isLight == null) {
      isLight = document.body.classList.contains('theme-light');
    }

    document.body.classList.toggle('theme-light', !isLight);
    document.body.classList.toggle('theme-dark',   isLight);
  },

  setDividingLine: function() {
    if (AMOUNT.row % 5 === 0) {
      Helpers._setDividingLine('row', AMOUNT.row, 5);
    } else if (AMOUNT.row % 4 === 0) {
      Helpers._setDividingLine('row', AMOUNT.row, 4);
    } else if (AMOUNT.row % 3 === 0) {
      Helpers._setDividingLine('row', AMOUNT.row, 3);
    } else {
      Helpers._setDividingLine('row', AMOUNT.row, 0);
    }

    if (AMOUNT.col % 5 === 0) {
      Helpers._setDividingLine('col', AMOUNT.col, 5);
    } else if (AMOUNT.col % 4 === 0) {
      Helpers._setDividingLine('col', AMOUNT.col, 4);
    } else if (AMOUNT.col % 3 === 0) {
      Helpers._setDividingLine('col', AMOUNT.col, 3);
    } else {
      Helpers._setDividingLine('col', AMOUNT.col, 0);
    }
  },

  _setDividingLine: function(prefix, amount, offset) {
    let next = false;
    for (let i = 0; i < amount; ++i) {
      const active = i % offset === 0;

      const boxes = document.querySelectorAll(`.box.${prefix}-${i}`);
      for (const box of boxes) {
        box.classList.toggle(`${prefix}-line`, active);
        box.classList.toggle(`${prefix}-line2`, next);
      }

      const controls = document.querySelectorAll(`.controls-container.${prefix}-${i}`);
      for (const control of controls) {
        control.classList.toggle(`${prefix}-line`, active);
        control.classList.toggle(`${prefix}-line2`, next);
      }

      next = i > 0 && active;
    }
  },

  clamp: function(min, val, max) {
    if (val < min) {
      return min;
    } else if (val > max) {
      return max;
    }

    return val;
  },

  isNumber: function(value) {
    return value != null && !isNaN(value) && !isNaN(parseFloat(value));
  },

  saveConfig: function() {
    if (document.cookie === '') {
      const confirmed = confirm('In order to save data, the website will have to save a cookie for you. Is that OK?');
      if (!confirmed) {
        return;
      }
    }

    const data = {
      theme: document.body.classList.contains('theme-light') ? 'l' : 'd',
      grid: {
        row: parseInt(GRID_DISPLAY.row.value, 10),
        col: parseInt(GRID_DISPLAY.col.value, 10),
      },
      difficulty: {
        min: parseInt(Generator.range.min, 10),
        max: parseInt(Generator.range.max, 10),
        combo_max: Generator.combo.max == null ? null : parseInt(Generator.combo.max, 10),
      },
    };
    document.cookie = `data=${JSON.stringify(data)}; Secure; SameSite = strict`;
  },

  loadConfig: function() {
    if (document.cookie === '') {
      return;
    }

    const data = JSON.parse(document.cookie.substring(5)); // 5 = 'data='.length

    // Theme
    Helpers.swapTheme(data.theme === 'd');

    // Grid
    while (AMOUNT.row > data.grid.row) { Row.remove(); }
    while (AMOUNT.row < data.grid.row) { Row.add([0]); }
    while (AMOUNT.col > data.grid.col) { Column.remove(); }
    while (AMOUNT.col < data.grid.col) { Column.add([0]); }

    // Difficulty
    ELEMENTS.difficulty.range.min.value = data.difficulty.min;
    ELEMENTS.difficulty.range.max.value = data.difficulty.max;
    Generator.range.set.min();
    Generator.range.set.max();
    if (data.difficulty.combo_max != null) {
      ELEMENTS.difficulty.combo.max.value = data.difficulty.combo_max;
      Generator.combo.set.max();
    }
  },
};

const Box = {
  _oddOrEven: ['even', 'odd'],
  _selected: {
    list: [],
    type: null,

    types: [],
    classes: [],
    classify: (x) => `selected-${x}`,
    querySelectorAll: '',

    SELECT: 'select',
    DESELECT: 'deselect',
    UNSET: 'unset',
    MEASURE: 'measure',
  },

  init: function() {
    document.addEventListener('mouseup', Box.onMouseUp);

    Box._selected.types = [
      Box._selected.UNSET, // 0
      Box._selected.SELECT, // 1
      Box._selected.DESELECT, // 2
      null, // 3
      Box._selected.MEASURE, // 4
    ];

    Box._selected.classes = [
      Box._selected.classify(Box._selected.UNSET),
      Box._selected.classify(Box._selected.SELECT),
      Box._selected.classify(Box._selected.DESELECT),
      Box._selected.classify(Box._selected.MEASURE),
    ];

    Box._selected.querySelectorAll = `.box.${Box._selected.classes.join(', .box.')}`;
  },

  add: function(row, column, addingColumn) {
    const box = Template.init(Template.box);

    box.classList.add(`row-${row}`, `col-${column}`);

    box.addEventListener('mouseenter', (e) => Box.onHovered(box, row, column));
    box.addEventListener('mouseleave', (e) => Box.onUnhovered(box, row, column));
    box.addEventListener('mousedown', Box.onMouseDown);

    if (!addingColumn) {
      ELEMENTS.CONTAINERS.box.appendChild(box);
      return;
    }

    const existingRowBoxes = document.querySelectorAll(`.box.row-${row}`);
    for (let i = 0; i < existingRowBoxes.length; ++i) {
      const existingColumn = parseInt(Array.from(existingRowBoxes[i].classList).find((x) => x.startsWith('col-')).substring(4), 10);
      if (existingColumn > column) {
        ELEMENTS.CONTAINERS.box.insertBefore(box, existingRowBoxes[i]);
        return;
      }
    }

    const lastBox = existingRowBoxes[existingRowBoxes.length - 1];
    if (lastBox.nextSibling) {
      ELEMENTS.CONTAINERS.box.insertBefore(box, lastBox.nextSibling);
    } else {
      ELEMENTS.CONTAINERS.box.appendChild(box);
    }
  },

  onHovered: function(box, row, column) {
    box.classList.add('hovered-primary');

    Box.hoverForSecondaries(box, `row-${row}`, true);
    Box.hoverForSecondaries(box, `col-${column}`, true);

    if (Box._selected.list.length === 0) {
      return;
    }

    for (const box of Box._selected.list) {
      box.classList.remove(...Box._selected.classes);
      box.getElementsByClassName('box-text')[0].innerText = '';
    }

    Box._selected.list.length = 1;
    if (Box._selected.list[0] === box) {
      return;
    }
    Box._selected.list[0].classList.add(Box._selected.classify(Box._selected.type));

    const start = Array.from(Box._selected.list[0].classList);
    const sr = parseInt(start.find((x) => x.startsWith('row-')).substring(4), 10);
    const sc = parseInt(start.find((x) => x.startsWith('col-')).substring(4), 10);
    const rdiff = Math.abs(sr - row);
    const cdiff = Math.abs(sc - column);

    if (cdiff > rdiff) {
      // Move along row
      const late = column < sc ? sc : column;
      const early = column < sc ? column : sc;

      const boxes = document.querySelectorAll(`.box.row-${sr}`);
      for (const box of boxes) {
        const bc = parseInt(Array.from(box.classList).find((x) => x.startsWith('col-')).substring(4), 10);

        if (bc > late) { break; } // Too late
        if (bc < early) { continue; } // Too early

        box.classList.add(Box._selected.classify(Box._selected.type));
        box.getElementsByClassName('box-text')[0].innerText = Box._selected.list.length;
        Box._selected.list.push(box);
      }
    } else {
      // Move along column
      const late = row < sr ? sr : row;
      const early = row < sr ? row : sr;

      const boxes = document.querySelectorAll(`.box.col-${sc}`);
      for (const box of boxes) {
        const br = parseInt(Array.from(box.classList).find((x) => x.startsWith('row-')).substring(4), 10);

        if (br > late) { break; } // Too late
        if (br < early) { continue; } // Too early

        box.classList.add(Box._selected.classify(Box._selected.type));
        box.getElementsByClassName('box-text')[0].innerText = Box._selected.list.length;
        Box._selected.list.push(box);
      }
    }
  },

  onUnhovered: function(box, row, column) {
    box.classList.remove('hovered-primary');

    Box.hoverForSecondaries(box, `row-${row}`, false);
    Box.hoverForSecondaries(box, `col-${column}`, false);
  },

  hoverForSecondaries: function(box, className, add) {
    const secondaries = document.getElementsByClassName(className);
    for (const secondary of secondaries) {
      if (secondary !== box) {
        secondary.classList.toggle('hovered-secondary', add);
      }
    }
  },

  onMouseDown: function(e) {
    if ([1, 2, 4].includes(e.buttons)) {
      Box._selected.list = [e.target];
      if (
        !e.ctrlKey &&
        (e.buttons === 1 && e.target.classList.contains('ticked')) ||
        (e.buttons === 2 && e.target.classList.contains('unticked'))
      ) {
        Box._selected.type = Box._selected.UNSET;
      } else if (e.shiftKey) {
        Box._selected.type = Box._selected.MEASURE;
      } else {
        Box._selected.type = Box._selected.types[e.buttons];
      }
    }
  },

  onMouseUp: function() {
    const single = Box._selected.list.length === 1;
    if (Box._selected.type === Box._selected.SELECT) {
      Box._onMouseUp((box) => {
        box.classList.remove('unticked');
        if (single) {
          box.classList.toggle('ticked');
        } else {
          box.classList.add('ticked');
        }
      });
    } else if (Box._selected.type === Box._selected.DESELECT) {
      Box._onMouseUp((box) => {
        box.classList.remove('ticked');
        if (single) {
          box.classList.toggle('unticked');
        } else {
          box.classList.add('unticked');
        }
      });
    } else if (Box._selected.type === Box._selected.UNSET) {
      Box._onMouseUp((box) => {
        box.classList.remove('ticked', 'unticked');
      });
    }

    const selected = document.querySelectorAll(Box._selected.querySelectorAll);
    for (const box of selected) {
      box.classList.remove(...Box._selected.classes);
      box.getElementsByClassName('box-text')[0].innerText = '';
    }
    Box._selected.list = [];
    Box._selected.type = null;
  },

  _onMouseUp: function(cb) {
    const affectedClasses = [];

    for (const box of Box._selected.list) {
      const classes = Array.from(box.classList);
      const row = classes.find((x) => x.startsWith('row-'));
      const col = classes.find((x) => x.startsWith('col-'));

      if (!affectedClasses.includes(row)) { affectedClasses.push(row); }
      if (!affectedClasses.includes(col)) { affectedClasses.push(col); }

      cb(box);
    }

    Helpers.checkForFinishedValues(affectedClasses);
  },
}

const Row = {
  add: function(values, colAmount = null) {
    AMOUNT.row += 1;
    GRID_DISPLAY.update();

    // Controls
    const container = Template.init(Template.controlsContainer);
    container.classList.add(`row-${AMOUNT.row}`);
    container.getElementsByClassName('add')[0].addEventListener('click', () => Row.control.add(container, 0));
    container.getElementsByClassName('sub')[0].addEventListener('click', () => Row.control.remove(container));
    for (const value of values) {
      Row.control.add(container, value);
    }
    ELEMENTS.CONTAINERS.rowControls.appendChild(container);

    // Boxes
    colAmount = colAmount ?? AMOUNT.col;
    for (let i = 0; i < colAmount; ++i) {
      Box.add(AMOUNT.row, i + 1, false);
    }

    Helpers.setDividingLine();
  },

  remove: function() {
    if (AMOUNT.row === 5) { return; } // Minimum amount
    AMOUNT.row -= 1;
    GRID_DISPLAY.update();

    const elements = document.getElementsByClassName(`row-${AMOUNT.row + 1}`);
    for (let i = 0; i < elements.length;) {
      elements[i].parentNode.removeChild(elements[i]);
    }

    Helpers.setDividingLine();
  },

  control: {
    add: function(container, value) {
      const controls = container.getElementsByClassName('control');
      if (controls.length === AMOUNT.row) { return; } // Maximum amount

      const control = Template.init(Template.control);
      control.value = value;

      if (controls.length > 0) {
        container.insertBefore(control, controls[0]);
      } else {
        container.appendChild(control);
      }
    },

    remove: function(container) {
      const controls = container.getElementsByClassName('control');
      if (controls.length === 1) { return; } // Minimum amount

      container.removeChild(controls[0]);
    },
  },
};

const Column = {
  add: function(values, rowAmount = null) {
    AMOUNT.col += 1;
    ELEMENTS.CONTAINERS.box.style.gridTemplateColumns = `repeat(${AMOUNT.col}, 1fr)`;
    GRID_DISPLAY.update();

    // Controls
    const container = Template.init(Template.controlsContainer);
    container.classList.add(`col-${AMOUNT.col}`);
    container.getElementsByClassName('add')[0].addEventListener('click', () => Column.control.add(container, 0));
    container.getElementsByClassName('sub')[0].addEventListener('click', () => Column.control.remove(container));
    for (const value of values) {
      Column.control.add(container, value);
    }
    ELEMENTS.CONTAINERS.colControls.appendChild(container);

    // Boxes
    rowAmount = rowAmount ?? AMOUNT.row;
    for (let i = 0; i < rowAmount; ++i) {
      Box.add(i + 1, AMOUNT.col, true);
    }

    Helpers.setDividingLine();
  },

  remove: function() {
    if (AMOUNT.col === 5) { return; } // Minimum amount
    AMOUNT.col -= 1;
    ELEMENTS.CONTAINERS.box.style.gridTemplateColumns = `repeat(${AMOUNT.col}, 1fr)`;
    GRID_DISPLAY.update();

    const elements = document.getElementsByClassName(`col-${AMOUNT.col + 1}`);
    for (let i = 0; i < elements.length;) {
      elements[i].parentNode.removeChild(elements[i]);
    }

    Helpers.setDividingLine();
  },

  control: {
    add: function(container, value) {
      const controls = container.getElementsByClassName('control');
      if (controls.length === AMOUNT.col) { return; } // Maximum amount

      const control = Template.init(Template.control);
      control.value = value;

      if (controls.length > 0) {
        container.insertBefore(control, controls[0]);
      } else {
        container.appendChild(control);
      }
    },

    remove: function(container) {
      const controls = container.getElementsByClassName('control');
      if (controls.length === 1) { return; } // Minimum amount

      container.removeChild(controls[0]);
    },
  },
};

const Random = {
  int: {
    between: function(min, max) {
      return Math.floor(Random.float.between(min, max));
    },
  },

  float: {
    between: function(min, max) {
      return Math.random() * (max - min + 1) + min;
    },
  },

  index: function(list) {
    return Random.int.between(0, list.length - 1);
  },

  element: function(list) {
    return list[Random.index(list)];
  },
}

const Generator = {
  range: {
    min: 60,
    max: 70,

    set: {
      min: function() {
        const value = ELEMENTS.difficulty.range.min.value;
        if (Helpers.isNumber(value)) {
          Generator.range.min = Helpers.clamp(1, parseInt(value, 10), Generator.range.max);
        }

        ELEMENTS.difficulty.range.min.value = Generator.range.min;
      },

      max: function() {
        const value = ELEMENTS.difficulty.range.max.value;
        if (Helpers.isNumber(value)) {
          Generator.range.max = Helpers.clamp(Generator.range.min, parseInt(value, 10), 100);
        }

        ELEMENTS.difficulty.range.max.value = Generator.range.max;
      },
    },

    init: function() {
      ELEMENTS.difficulty.range.min.value = Generator.range.min;
      ELEMENTS.difficulty.range.max.value = Generator.range.max;

      ELEMENTS.difficulty.range.min.addEventListener('blur', Generator.range.set.min);
      ELEMENTS.difficulty.range.max.addEventListener('blur', Generator.range.set.max);
    },
  },

  combo: {
    max: null,

    set: {
      max: function() {
        const value = ELEMENTS.difficulty.combo.max.value;
        if (value === '') {
          Generator.combo.max = null;
        } else if (Helpers.isNumber(value)) {
          Generator.combo.max = Helpers.clamp(0, parseInt(value, 10), Math.max(AMOUNT.col, AMOUNT.row));
        }

        ELEMENTS.difficulty.combo.max.value = Generator.combo.max;
      },
    },

    init: function() {
      ELEMENTS.difficulty.combo.max.value = Generator.combo.max;
      ELEMENTS.difficulty.combo.max.addEventListener('blur', Generator.combo.set.max);
    },
  },

  boxCanBeSet: function(box, selectedBoxes) {
    if (Generator.combo.max == null) {
      return true;
    }

    const col = parseInt(Array.from(box.classList).find(x => x.startsWith('col-')).substring(4), 10);
    const row = parseInt(Array.from(box.classList).find(x => x.startsWith('row-')).substring(4), 10);

    // Column value
    const selectedRows = Array.from(document.getElementsByClassName(`col-${col}`))
      .filter(x => selectedBoxes.includes(x))
      .map(a => parseInt(Array.from(a.classList).find(x => x.startsWith('row-')).substring(4), 10))
      .sort((a, b) => a > b);

    let colValue = 1;
    for (let i = row - 1; i >= 0; --i) {
      if (!selectedRows.includes(i)) { break; }
      colValue += 1;
    }
    for (let i = row + 1; i <= AMOUNT.row; ++i) {
      if (!selectedRows.includes(i)) { break; }
      colValue += 1;
    }

    // Row value
    const selectedCols = Array.from(document.getElementsByClassName(`row-${row}`))
      .filter(x => selectedBoxes.includes(x))
      .map(a => parseInt(Array.from(a.classList).find(x => x.startsWith('col-')).substring(4), 10))
      .sort((a, b) => a > b);

    let rowValue = 1;
    for (let i = col - 1; i >= 0; --i) {
      if (!selectedCols.includes(i)) { break; }
      rowValue += 1;
    }
    for (let i = col + 1; i <= AMOUNT.col; ++i) {
      if (!selectedCols.includes(i)) { break; }
      rowValue += 1;
    }

    return !(colValue > Generator.combo.max || rowValue > Generator.combo.max);
  },

  generate: function() {
    ELEMENTS.winnerDisplay.classList.add('hidden');
    Generator._disableFieldManipulation();

    const boxes = document.getElementsByClassName('box');
    Generator._resetBoxes(boxes);

    const filled = Generator._filledRange(boxes.length);
    let freeBoxes = Array.from(boxes);
    const selectedBoxes = [];
    for (let i = 0; i < filled && freeBoxes.length > 0;) {
      const idx = Random.index(freeBoxes);
      const box = freeBoxes[idx];
      freeBoxes.splice(idx, 1);
      if (!Generator.boxCanBeSet(box, selectedBoxes)) {
        continue;
      }

      selectedBoxes.push(box);
      ++i;
    }

    const classes = Generator._getRowAndColClasses();
    for (const c of classes) {
      const boxes = document.querySelectorAll(`.box.${c}`);
      const values = Helpers.calculateValues(boxes, (x) => selectedBoxes.includes(x));
      const container = document.querySelector(`.controls-container.${c}`);
      container.classList.remove('finished');
      Generator._addValues(values, container);
    }
  },

  reset: function() {
    ELEMENTS.winnerDisplay.classList.add('hidden');

    const boxes = document.getElementsByClassName('box');
    Generator._resetBoxes(boxes);

    const controls = document.querySelectorAll('.control.finished');
    for (const c of controls) {
      if (parseInt(c.value, 10) !== 0) {
        c.classList.remove('finished');
        c.parentElement.classList.remove('finished');
      }
    }
  },

  _filledRange: function(total) {
    return Random.int.between(total * (Generator.range.min / 100), total * (Generator.range.max / 100));
  },

  _disableFieldManipulation: function() {
    ELEMENTS.field.classList.add('generated');

    ELEMENTS.colHandling.classList.add('hidden');
    ELEMENTS.rowHandling.classList.add('hidden');
    GRID_DISPLAY.disable();

    ELEMENTS.btn.reset.disabled = false;
    const controls = document.getElementsByClassName('control');
    for (let i = 0; i < controls.length;) {
      controls[i].parentNode.removeChild(controls[i]);
    }
  },

  _resetBoxes: function(boxes) {
    for (const box of boxes) {
      box.classList.remove('ticked', 'unticked');
    }
  },

  _getRowAndColClasses: function() {
    const classes = [];
    for (let i = 0; i < AMOUNT.row; ++i) {
      classes.push(`row-${i + 1}`);
    }
    for (let i = 0; i < AMOUNT.col; ++i) {
      classes.push(`col-${i + 1}`);
    }
    return classes;
  },

  _addValues: function(values, container) {
    for (const value of values) {
      const elem = Template.init(Template.control);
      elem.disabled = true;
      elem.value = value;
      if (value === 0) {
        elem.classList.add('finished');
        container.classList.add('finished');
      }
      container.appendChild(elem);
    }
  },
};

window.addEventListener('load', () => {
  const isWide = screen.width > screen.height;
  document.body.classList.toggle('wide',  isWide);
  document.body.classList.toggle('high', !isWide);

  ELEMENTS.field = document.getElementById('field');
  ELEMENTS.winnerDisplay = document.getElementById('winner-display');
  ELEMENTS.colHandling = document.getElementById('col-handling');
  ELEMENTS.rowHandling = document.getElementById('row-handling');

  ELEMENTS.difficulty.range.min = document.getElementById('difficulty-range-min');
  ELEMENTS.difficulty.range.max = document.getElementById('difficulty-range-max');
  ELEMENTS.difficulty.combo.max = document.getElementById('difficulty-combo-max');

  ELEMENTS.CONTAINERS.box = document.getElementById('box-container');
  ELEMENTS.CONTAINERS.rowControls = document.getElementById('row-controls');
  ELEMENTS.CONTAINERS.colControls = document.getElementById('col-controls');

  Template.box = document.getElementById('template-box');
  Template.control = document.getElementById('template-control');
  Template.controlsContainer = document.getElementById('template-controls-container');

  GRID_DISPLAY.init();

  for (let r = 0; r < AMOUNT.rowDefault; ++r) {
    Row.add([0], AMOUNT.colDefault);
  }

  for (let c = 0; c < AMOUNT.colDefault; ++c) {
    Column.add([0], 0);
  }

  ELEMENTS.btn.reset = document.getElementById('reset-btn');
  ELEMENTS.btn.reset.disabled = true;
  ELEMENTS.btn.reset.addEventListener('click', Generator.reset);

  document.getElementById('generate-btn').addEventListener('click', Generator.generate);
  document.getElementById('swap-theme-btn').addEventListener('click', () => Helpers.swapTheme());
  document.getElementById('save-config-btn').addEventListener('click', Helpers.saveConfig);

  document.getElementById('sub-col-btn').addEventListener('click', () => Column.remove());
  document.getElementById('add-col-btn').addEventListener('click', () => Column.add([0]));

  document.getElementById('sub-row-btn').addEventListener('click', () => Row.remove());
  document.getElementById('add-row-btn').addEventListener('click', () => Row.add([0]));

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  Generator.range.init();
  Generator.combo.init();
  Box.init();

  Helpers.loadConfig();
});