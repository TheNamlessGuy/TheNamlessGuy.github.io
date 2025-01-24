class PuzzlePieceElement extends HTMLElement {
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
   * @param {string} imgURL
   * @param {number} imgOffsetX
   * @param {number} imgOffsetY
   */
  constructor(x, y, w, h, imgURL, imgOffsetX, imgOffsetY) {
    super();

    this._rect.x = x;
    this._rect.y = y;
    this._rect.w = w;
    this._rect.h = h;

    this._offset.x = imgOffsetX;
    this._offset.y = imgOffsetY;

    this.id = `piece-${this.x}x${this.y}`;

    const img = document.createElement('img');
    img.src = imgURL;
    this.append(img);

    this.style.width = `${this.fullW}px`;
    this.style.height = `${this.fullH}px`;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  setPosition(x, y) {
    this.style.top = `${(y * this.h) - this._offset.y}px`;
    this.style.left = `${(x * this.w) - this._offset.x}px`;
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
  get fullW() { return this._rect.w + (this._offset.x * 2); }
  /**
   * @returns {number}
   */
  get fullH() { return this._rect.h + (this._offset.y * 2); }

  /**
   * @returns {{x: number, y: number}}
   */
  center() {
    const box = this.getBoundingClientRect();
    return {
      x: box.x + (box.width / 2),
      y: box.y + (box.height / 2),
    };
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('puzzle-piece', PuzzlePieceElement));