class PuzzlePieceContainerElement extends HTMLElement {
  /** @type {{x: number, y: number}} */
  _maxPiecePos = {
    x: -1,
    y: -1,
  };

  /** @type {{x: number, y: number}} */
  _min = {
    x: 0,
    y: 0,
  };

  /** @type {HTMLDivElement} */
  _container = null;

  /** @type {{listeners: {mousemove: (e: MouseEvent) => void, mouseup: (e: MouseEvent) => void}, grabOffset: {x: number, y: number}}} */
  _holdData = {
    listeners: {
      mousemove: () => {},
      mouseup: () => {},
    },

    grabOffset: {
      x: 0,
      y: 0,
    },
  };

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    super();

    this._maxPiecePos.x = x;
    this._maxPiecePos.y = y;

    this._container = document.createElement('div');
    this._container.style.position = 'relative';
    this._container.style.display = 'inline-block';
    this.append(this._container);

    this.addEventListener('mousedown', this._onMouseDown.bind(this));
  }

  /**
   * @param {PuzzlePieceElement} piece
   * @param {boolean} [generateSlots=true]
   * @returns {void}
   */
  addPiece(piece, generateSlots = true) {
    const oldPosition = {
      x: parseFloat(this.style.left) || 0,
      y: parseFloat(this.style.top) || 0,
    };

    const oldMin = {
      x: this._min.x,
      y: this._min.y,
    };

    this._container.append(piece);

    const pieces = this._pieces();

    this._min.x = Math.min(...pieces.map(piece => piece.x));
    this._min.y = Math.min(...pieces.map(piece => piece.y));

    if (pieces.length > 1) { // Had a piece before calling this
      const expansion = {
        x: oldMin.x - this._min.x,
        y: oldMin.y - this._min.y,
      };

      this.setGlobalPosition(oldPosition.x - (expansion.x * piece.w), oldPosition.y - (expansion.y * piece.h));
    }

    pieces.forEach(p => p.setContainerPosition(p.x - this._min.x, p.y - this._min.y));

    if (generateSlots) {
      this._generateSlots();
    }

    const maxX = Math.max(...pieces.map(piece => piece.x));
    const maxY = Math.max(...pieces.map(piece => piece.y));
    this._container.style.width = `${((maxX - this._min.x) * piece.w) + piece.fullW}px`;
    this._container.style.height = `${((maxY - this._min.y) * piece.h) + piece.fullH}px`;
    this.style.width = this._container.style.width;
    this.style.height = this._container.style.height;
  }

  /**
   * @param {PuzzlePieceSlotElement} slot
   * @param {number} [offsetX=0]
   * @param {number} [offsetY=0]
   * @returns {void}
   */
  addSlot(slot, offsetX = 0, offsetY = 0) {
    this._container.append(slot);
    slot.setPosition(
      slot.x - this._min.x,
      slot.y - this._min.y,
      offsetX, offsetY,
    );
  }

  /**
   * @param {PuzzlePieceElement} piece
   * @returns {boolean} Whether or not the piece is slottable within this container
   */
  isSlottable(piece) {
    return this._slots().some((slot) => slot.isSlottable(piece));
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  setGlobalPosition(x, y) {
    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
  }

  /**
   * @returns {void}
   */
  moveable() { this.classList.add('moveable'); }

  /**
   * @returns {number}
   */
  x() { return this._min.x; };
  /**
   * @returns {number}
   */
  y() { return this._min.y; };
  /**
   * @returns {number}
   */
  w() { return parseFloat(this.style.width); };
  /**
   * @returns {number}
   */
  h() { return parseFloat(this.style.height); };

  /**
   * @param {PuzzlePieceContainerElement} container
   * @returns {void}
   */
  merge(container) {
    container._pieces().forEach(piece => this.addPiece(piece, false));
    this._generateSlots();
  }

  /**
   * @returns {void}
   */
  _generateSlots() {
    this._slots().forEach(x => x.remove());

    const pieces = this._pieces();

    /**
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    const hasPiece = (x, y) => pieces.some(piece => piece.x === x && piece.y === y);

    for (const piece of pieces) {
      if (piece.x > 0 && !hasPiece(piece.x - 1, piece.y)) {
        this.addSlot(new PuzzlePieceSlotElement(piece.x - 1, piece.y, piece.w, piece.h), piece._offset.x, piece._offset.y);
      }

      if (piece.x + 1 < this._maxPiecePos.x && !hasPiece(piece.x + 1, piece.y)) {
        this.addSlot(new PuzzlePieceSlotElement(piece.x + 1, piece.y, piece.w, piece.h), piece._offset.x, piece._offset.y);
      }

      if (piece.y > 0 && !hasPiece(piece.x, piece.y - 1)) {
        this.addSlot(new PuzzlePieceSlotElement(piece.x, piece.y - 1, piece.w, piece.h), piece._offset.x, piece._offset.y);
      }

      if (piece.y + 1 < this._maxPiecePos.y && !hasPiece(piece.x, piece.y + 1)) {
        this.addSlot(new PuzzlePieceSlotElement(piece.x, piece.y + 1, piece.w, piece.h), piece._offset.x, piece._offset.y);
      }
    }
  }

  /**
   * @returns {PuzzlePieceSlotElement[]}
   */
  _slots() {
    return Array.from(
      /** @type {HTMLCollectionOf<PuzzlePieceSlotElement>} */
      (this.getElementsByTagName('puzzle-piece-slot'))
    );
  }

  /**
   * @returns {PuzzlePieceElement[]}
   */
  _pieces() {
    return Array.from(
      /** @type {HTMLCollectionOf<PuzzlePieceElement>} */
      (this.getElementsByTagName('puzzle-piece'))
    );
  }

  /**
   * @param {MouseEvent} e
   * @returns {void}
   */
  _onMouseDown(e) {
    if (e.button !== 0) { return; }
    e.preventDefault();
    if (!this.classList.contains('moveable')) { return; }

    this._holdData.grabOffset.x = Math.abs(e.clientX - parseFloat(this.style.left));
    this._holdData.grabOffset.y = Math.abs(e.clientY - parseFloat(this.style.top));

    this._holdData.listeners.mousemove = this._onMouseMove.bind(this);
    document.addEventListener('mousemove', this._holdData.listeners.mousemove);

    this._holdData.listeners.mouseup = this._onMouseUp.bind(this);
    document.addEventListener('mouseup', this._holdData.listeners.mouseup);

    this.classList.add('held');
  }

  /**
   * @param {MouseEvent} e
   * @returns {void}
   */
  _onMouseMove(e) {
    e.preventDefault();

    const w = parseFloat(this.style.width);
    const h = parseFloat(this.style.height);
    this.style.left = Math.clamp(0, e.clientX - this._holdData.grabOffset.x, document.documentElement.clientWidth - w) + 'px';
    this.style.top = Math.clamp(0, e.clientY - this._holdData.grabOffset.y, document.documentElement.clientHeight - h) + 'px';
  }

  /**
   * @returns {void}
   */
  _onMouseUp() {
    const zIndex = parseInt(this.style.zIndex, 10);
    const containers = document.getElementsByTagName('puzzle-piece-container');
    Array.from(containers).forEach((container) => {
      const otherZIndex = parseInt(container.style.zIndex, 10);
      if (otherZIndex > zIndex) {
        container.style.zIndex = otherZIndex - 1;
      }
    });

    this.style.zIndex = containers.length.toString(10);
    this.classList.remove('held');

    document.removeEventListener('mousemove', this._holdData.listeners.mousemove);
    document.removeEventListener('mouseup', this._holdData.listeners.mouseup);

    this._slotIfPossible();
  }

  /**
   * @returns {void}
   */
  _slotIfPossible() {
    const pieces = this._pieces();

    for (const piece of pieces) {
      const slots = Array.from(
        /** @type {HTMLCollectionOf<PuzzlePieceSlotElement>} */
        (document.getElementsByClassName(`slot-${piece.x}x${piece.y}`))
      );

      for (const slot of slots) {
        if (slot.isSlottable(piece)) {
          slot.container.merge(this);
          this.remove();
          return;
        }
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('puzzle-piece-container', PuzzlePieceContainerElement));
