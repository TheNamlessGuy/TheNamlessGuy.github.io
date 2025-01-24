class SolveContainerElement extends PuzzlePieceContainerElement {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    super(x, y);

    this.style.display = 'inline-block';
    this.style.width = '100%';
    this.style.height = '100%';

    this._container.style.width = '100%';
    this._container.style.height = '100%';
  }

  /**
   * @param {PuzzlePieceElement} piece
   * @returns {void}
   */
  addPiece(piece) {
    this._container.append(piece);
    piece.setPosition(piece.x, piece.y);
    this._slots().find(slot => slot.x === piece.x && slot.y === piece.y)?.remove();
  }

  /**
   * @returns {void}
   */
  _generateSlots() {
    // Noop
  }

  /**
   * @param {PuzzlePieceContainerElement} container
   * @returns {void}
   */
  merge(container) {
    super.merge(container);

    if (this._slots().length === 0 && this._onWinCallback) {
      this._onWinCallback();
    }
  }

  _onWinCallback = null;
  onWin(callback) {
    this._onWinCallback = callback;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('solve-container', SolveContainerElement));