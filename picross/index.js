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

  difficultyRange: {
    min: null,
    max: null,
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
};

const AMOUNT = {
  row: 0,
  col: 0,
  rowDefault: 10,
  colDefault: 10,
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
  calculateValues: function(boxes, isSelected, stopProcessing = () => false, returnZeroIfEmpty = true) {
    const values = [];
    let combo = 0;

    for (let i = 0; i < boxes.length; ++i) {
      if (stopProcessing(boxes[i])) {
        break;
      }

      const selected = isSelected(boxes[i]);
      if (combo > 0 && !selected) {
        values.push(combo);
        combo = 0;
      } else if (selected) {
        combo += 1;
      }
    }

    if (combo > 0 || (returnZeroIfEmpty && values.length === 0)) {
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
        control.classList.add('finished');
      }

      return;
    } else {
      for (const control of controls) {
        control.classList.remove('finished');
      }
    }

    // Check for "anchored" sequences from the beginning
    let values = Helpers.calculateValues(boxes, (x) => x.classList.contains('ticked'), (x) => !x.classList.contains('ticked') && !x.classList.contains('unticked'), false);
    for (let i = 0; i < values.length && i < controlValues.length; ++i) {
      if (values[i] === controlValues[i]) {
        controls[i].classList.add('finished');
      } else {
        break;
      }
    }

    // Check for "anchored" sequences from the end
    boxes = boxes.reverse();
    values = Helpers.calculateValues(boxes, (x) => x.classList.contains('ticked'), (x) => !x.classList.contains('ticked') && !x.classList.contains('unticked'), false);
    console.log(c, 1, values, controlValues);
    for (let i = 0, j = controlValues.length - 1; i < values.length, j > 0; ++i, --j) {
      if (values[i] === controlValues[j]) {
        controls[j].classList.add('finished');
      } else {
        break;
      }
    }
  },

  _checkIfWon: function() {
    const unsolved = document.querySelectorAll(`.control:not(.finished)`);
    if (unsolved.length === 0) {
      ELEMENTS.winnerDisplay.classList.remove('hidden');

      ELEMENTS.colHandling.classList.remove('hidden');
      ELEMENTS.rowHandling.classList.remove('hidden');
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

  swapTheme: function() {
    const isLight = document.body.classList.contains('theme-light');
    document.body.classList.toggle('theme-light', !isLight);
    document.body.classList.toggle('theme-dark',   isLight);
  },

  updateGridDisplay: function() {
    GRID_DISPLAY.row.innerText = AMOUNT.row;
    GRID_DISPLAY.col.innerText = AMOUNT.col;
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
      const boxes = document.querySelectorAll(`.box.${prefix}-${i}`);
      const active = i % offset === 0;

      for (const box of boxes) {
        box.classList.toggle(`${prefix}-line`, active);
        box.classList.toggle(`${prefix}-line2`, next);
      }

      next = active;
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
    Helpers.updateGridDisplay();

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
    Helpers.updateGridDisplay();

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
    Helpers.updateGridDisplay();

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
    Helpers.updateGridDisplay();

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
    max: 80,

    set: {
      min: function() {
        const value = ELEMENTS.difficultyRange.min.value;
        if (Helpers.isNumber(value)) {
          Generator.range.min = Helpers.clamp(1, parseInt(value, 10), Generator.range.max);
        }

        ELEMENTS.difficultyRange.min.value = Generator.range.min;
      },

      max: function() {
        const value = ELEMENTS.difficultyRange.max.value;
        if (Helpers.isNumber(value)) {
          Generator.range.max = Helpers.clamp(Generator.range.min, parseInt(value, 10), 100);
        }

        ELEMENTS.difficultyRange.max.value = Generator.range.max;
      },
    },

    init: function() {
      ELEMENTS.difficultyRange.min.value = Generator.range.min;
      ELEMENTS.difficultyRange.max.value = Generator.range.max;

      ELEMENTS.difficultyRange.min.addEventListener('blur', Generator.range.set.min);
      ELEMENTS.difficultyRange.max.addEventListener('blur', Generator.range.set.max);
    },
  },

  generate: function() {
    ELEMENTS.winnerDisplay.classList.add('hidden');
    Generator._disableFieldManipulation();

    const boxes = document.getElementsByClassName('box');
    Generator._resetBoxes(boxes);

    const filled = Generator._filledRange(boxes.length);
    let freeBoxes = Array.from(boxes);
    const selectedBoxes = [];
    for (let i = 0; i < filled; ++i) {
      const idx = Random.index(freeBoxes);
      const box = freeBoxes[idx];
      freeBoxes.splice(idx, 1);

      selectedBoxes.push(box);
    }

    const classes = Generator._getRowAndColClasses();
    for (const c of classes) {
      const boxes = document.querySelectorAll(`.box.${c}`);
      const values = Helpers.calculateValues(boxes, (x) => selectedBoxes.includes(x));
      const container = document.querySelector(`.controls-container.${c}`);
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

  ELEMENTS.difficultyRange.min = document.getElementById('difficulty-range-min');
  ELEMENTS.difficultyRange.max = document.getElementById('difficulty-range-max');

  ELEMENTS.CONTAINERS.box = document.getElementById('box-container');
  ELEMENTS.CONTAINERS.rowControls = document.getElementById('row-controls');
  ELEMENTS.CONTAINERS.colControls = document.getElementById('col-controls');

  Template.box = document.getElementById('template-box');
  Template.control = document.getElementById('template-control');
  Template.controlsContainer = document.getElementById('template-controls-container');

  GRID_DISPLAY.row = document.getElementById('grid-size-display-row');
  GRID_DISPLAY.col = document.getElementById('grid-size-display-col');

  for (let r = 0; r < AMOUNT.rowDefault; ++r) {
    Row.add([AMOUNT.colDefault], AMOUNT.colDefault);
  }

  for (let c = 0; c < AMOUNT.colDefault; ++c) {
    Column.add([AMOUNT.rowDefault], 0);
  }

  ELEMENTS.btn.reset = document.getElementById('reset-btn');
  ELEMENTS.btn.reset.disabled = true;
  ELEMENTS.btn.reset.addEventListener('click', Generator.reset);

  document.getElementById('generate-btn').addEventListener('click', Generator.generate);
  document.getElementById('swap-theme-btn').addEventListener('click', Helpers.swapTheme);

  document.getElementById('sub-col-btn').addEventListener('click', () => Column.remove());
  document.getElementById('add-col-btn').addEventListener('click', () => Column.add([0]));

  document.getElementById('sub-row-btn').addEventListener('click', () => Row.remove());
  document.getElementById('add-row-btn').addEventListener('click', () => Row.add([0]));

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  Generator.range.init();
  Box.init();
});