const CONTAINERS = {
  box: null,
  rowControls: null,
  colControls: null,
};

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
  calculateValues: function(boxes, isSelected) {
    const values = [];
    let combo = 0;

    for (let i = 0; i < boxes.length; ++i) {
      const selected = isSelected(boxes[i]);
      if (combo > 0 && !selected) {
        values.push(combo);
        combo = 0;
      } else if (selected) {
        combo += 1;
      }
    }

    if (values.length === 0 || combo > 0) {
      values.push(combo);
    }

    return values;
  },

  checkForFinishedValues: function(box) {
    const classes = Array.from(box.classList);
    Helpers._checkForFinishedValues(classes.find((x) => x.startsWith('row-')));
    Helpers._checkForFinishedValues(classes.find((x) => x.startsWith('col-')));
    Helpers._checkIfWon();
  },

  _checkForFinishedValues: function(c) {
    const controls = Array.from(document.querySelectorAll(`.controls-container.${c}`)).flatMap((x) => Array.from(x.getElementsByClassName('control')));
    const controlValues = controls.map((x) => parseInt(x.value, 10));
    const boxes = document.querySelectorAll(`.box.${c}`);
    const boxValues = Helpers.calculateValues(boxes, (x) => x.classList.contains('ticked'));
    if (Helpers.equal.array(controlValues, boxValues)) {
      for (const control of controls) {
        control.classList.add('finished');
      }
    } else {
      for (const control of controls) {
        control.classList.remove('finished');
      }
    }
  },

  _checkIfWon: function() {
    const unsolved = document.querySelectorAll(`.control:not(.finished)`);
    if (unsolved.length > 0) {
      return;
    }

    // All controls are finished
    document.getElementById('winner-display').classList.remove('hidden');
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
    if (document.body.classList.contains('theme-dark')) {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
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
};

const Box = {
  _oddOrEven: ['even', 'odd'],

  add: function(row, column, addingColumn) {
    const box = Template.init(Template.box);

    box.classList.add(`row-${row}`, `col-${column}`);

    box.addEventListener('mouseenter', () => Box.onHovered(box, row, column));
    box.addEventListener('mouseleave', () => Box.onUnhovered(box, row, column));
    box.addEventListener('mouseup', (e) => Box.onClicked(e, box));
    box.addEventListener('contextmenu', (e) => e.preventDefault());

    if (!addingColumn) {
      CONTAINERS.box.appendChild(box);
      return;
    }

    const existingRowBoxes = document.querySelectorAll(`.box.row-${row}`);
    for (let i = 0; i < existingRowBoxes.length; ++i) {
      const existingColumn = parseInt(Array.from(existingRowBoxes[i].classList).find((x) => x.startsWith('col-')).substring(4), 10);
      if (existingColumn > column) {
        CONTAINERS.box.insertBefore(box, existingRowBoxes[i]);
        return;
      }
    }

    const lastBox = existingRowBoxes[existingRowBoxes.length - 1];
    if (lastBox.nextSibling) {
      CONTAINERS.box.insertBefore(box, lastBox.nextSibling);
    } else {
      CONTAINERS.box.appendChild(box);
    }
  },

  onHovered: function(box, row, column) {
    box.classList.add('hovered-primary');

    Box.hoverForSecondaries(box, `row-${row}`, true);
    Box.hoverForSecondaries(box, `col-${column}`, true);
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

  onClicked: function(e, box) {
    if (e.button === 2) { // Right click
      box.classList.remove('ticked');
      box.classList.toggle('unticked');

      Helpers.checkForFinishedValues(box);
    } else if (e.button === 0) { // Left click
      box.classList.toggle('ticked');
      box.classList.remove('unticked');

      Helpers.checkForFinishedValues(box);
    }
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
    CONTAINERS.rowControls.appendChild(container);

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
    CONTAINERS.box.style.gridTemplateColumns = `repeat(${AMOUNT.col}, 1fr)`;
    Helpers.updateGridDisplay();

    // Controls
    const container = Template.init(Template.controlsContainer);
    container.classList.add(`col-${AMOUNT.col}`);
    container.getElementsByClassName('add')[0].addEventListener('click', () => Column.control.add(container, 0));
    container.getElementsByClassName('sub')[0].addEventListener('click', () => Column.control.remove(container));
    for (const value of values) {
      Column.control.add(container, value);
    }
    CONTAINERS.colControls.appendChild(container);

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
    CONTAINERS.box.style.gridTemplateColumns = `repeat(${AMOUNT.col}, 1fr)`;
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
  generate: function() {
    document.getElementById('winner-display').classList.add('hidden');
    Generator._disableFieldManipulation();

    const boxes = document.getElementsByClassName('box');
    Generator._resetBoxes(boxes);

    // Select 60-80% of the available squares
    const filled = Random.int.between(boxes.length * 0.6, boxes.length * 0.8);

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

  _disableFieldManipulation: function() {
    document.getElementById('field').classList.add('generated');
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
      container.appendChild(elem);
    }
  },
};

window.addEventListener('load', () => {
  CONTAINERS.box = document.getElementById('box-container');
  CONTAINERS.rowControls = document.getElementById('row-controls');
  CONTAINERS.colControls = document.getElementById('col-controls');

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

  document.getElementById('generate-btn').addEventListener('click', Generator.generate);
  document.getElementById('swap-theme-btn').addEventListener('click', Helpers.swapTheme);

  document.getElementById('sub-col-btn').addEventListener('click', () => Column.remove());
  document.getElementById('add-col-btn').addEventListener('click', () => Column.add([0]));

  document.getElementById('sub-row-btn').addEventListener('click', () => Row.remove());
  document.getElementById('add-row-btn').addEventListener('click', () => Row.add([0]));
});