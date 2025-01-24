class PuzzlePieceSlotElement extends HTMLElement {
  _rect = {
    x: null,
    y: null,
    w: null,
    h: null,
  };

  _offset = {
    x: null,
    y: null,
  };

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @returns {void}
   */
  constructor(x, y, w, h) {
    super();

    this._rect.x = x;
    this._rect.y = y;
    this._rect.w = w;
    this._rect.h = h;

    this.classList.add(`slot-${this.x}x${this.y}`);

    this.style.width = `${w}px`;
    this.style.height = `${h}px`;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} [offsetX=0]
   * @param {number} [offsetY=0]
   * @returns {void}
   */
  setPosition(x, y, offsetX = 0, offsetY = 0) {
    this.style.top = `${(y * this.h) + offsetY}px`;
    this.style.left = `${(x * this.w) + offsetX}px`;
  }

  /**
   * @param {PuzzlePieceElement} piece
   * @returns {boolean} Whether or not the piece is slottable within this slot
   */
  isSlottable(piece) {
    if (piece.x !== this.x || piece.y !== this.y) {
      return false;
    }

    const center = piece.center();
    const hitbox = this._hitbox();

    return (
      center.x >= hitbox.x1 &&
      center.x <= hitbox.x2 &&
      center.y >= hitbox.y1 &&
      center.y <= hitbox.y2
    );
  }

  /**
   * @returns {number}
   */
  get x() { return this._rect.x; }
  /**
   * @returns {number}
   */
  get y() { return this._rect.y; }
  /**
   * @returns {number}
   */
  get w() { return this._rect.w; }
  /**
   * @returns {number}
   */
  get h() { return this._rect.h; }
  /**
   * @returns {number}
   */
  get offsetX() { return this._offset.x; }
  /**
   * @returns {number}
   */
  get offsetY() { return this._offset.y; }

  /**
   * @returns {PuzzlePieceContainerElement}
   */
  get container() { return this.parentElement.parentElement; }

  /**
   * @returns {{x1: number, x2: number, y1: number, y2: number}}
   */
  _hitbox() {
    const box = this.getBoundingClientRect();
    return {
      x1: box.x + (box.width * 0.35),
      x2: box.x + (box.width * 0.65),
      y1: box.y + (box.height * 0.35),
      y2: box.y + (box.height * 0.65),
    };
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('puzzle-piece-slot', PuzzlePieceSlotElement));