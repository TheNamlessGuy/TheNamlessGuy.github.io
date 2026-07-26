Random.position = function(w, h) {
  const box = Elements.solveBox().getBoundingClientRect();
  const leftSide = Random.bool();
  return {
    x: leftSide ? Random.integer(0, box.x - w) : Random.integer(box.right, document.documentElement.clientWidth - w),
    y: Random.integer(box.top, Math.clamp(box.bottom, box.bottom, document.documentElement.clientHeight - h)),
  };
};

const Elements = {
  errors: () => { return (/** @type {HTMLDivElement} */ (document.getElementById('errors'))); },
  generate: () => { return (/** @type {HTMLButtonElement} */ (document.getElementById('generate'))); },
  pieceLocationContainer: () => { return (/** @type {HTMLDivElement} */ (document.getElementById('piece-location-container'))); },
  pieces: () => { return (/** @type {HTMLDivElement} */ (document.getElementById('pieces'))); },
  piecesAmount: () => { return (/** @type {HTMLInputElement} */ (document.getElementById('pieces-amount'))); },
  piecesAmountX: () => { return (/** @type {HTMLInputElement} */ (document.getElementById('pieces-amount-x'))); },
  piecesAmountY: () => { return (/** @type {HTMLInputElement} */ (document.getElementById('pieces-amount-y'))); },
  selectedImgName: () => { return (/** @type {HTMLLabelElement} */ (document.getElementById('selected-img-name'))); },
  selectImage: () => { return (/** @type {HTMLButtonElement} */ (document.getElementById('select-image'))); },
  solveBox: () => { return (/** @type {HTMLDivElement} */ (document.getElementById('solve-box'))); },
  solveBoxContainer: () => { return (/** @type {HTMLDivElement} */ (document.getElementById('solve-box-container'))); },
  solveImg: () => { return (/** @type {HTMLImageElement} */ (document.getElementById('solve-img'))); },
};

const Errors = {
  clear: function() {
    const container = /** @type {HTMLDivElement} */ (document.getElementById('errors'));
    container.style.display = 'none';
    while (container.children.length > 0) { container.children[0].remove(); }
  },

  add: function(msg) {
    const container = Elements.errors();
    container.style.display = null;

    const error = document.createElement('div');
    error.classList.add('error');

    const message = document.createElement('span');
    message.innerText = msg;
    error.append(message);

    const x = document.createElement('button');
    x.innerText = '⨯';
    x.addEventListener('click', () => {
      error.remove();
      if (container.children.length === 0) { Errors.clear(); }
    });
    error.append(x);

    container.append(error);
  },
};

const PuzzleImage = {
  helpers: {
    xbit: null,
    xhole: null,
    ybit: null,
    yhole: null,
  },

  onSelected: () => {
    Errors.clear();

    const btn = Elements.generate();
    btn.title = 'Image has not loaded yet';
    btn.disabled = true;
  },

  onFetched: (data) => {
    Elements.solveImg().src = data.src;
    Elements.selectedImgName().textContent = data.name;
  },

  onError: (error) => {
    (/** @type {HTMLButtonElement} */ (document.getElementById('generate'))).title = 'Image could not be loaded';
    Errors.add(error);
  },

  select: () => {
    ImageSelectModalElement.open({
      onSelected: PuzzleImage.onSelected,
      onFetched: PuzzleImage.onFetched,
      onError: PuzzleImage.onError,
    });
  },
};

const Puzzle = {
  generate: () => {
    Errors.clear();

    /** @type {{x: number, y: number, total: number}} */
    const amount = {
      x: parseInt(Elements.piecesAmountX().value, 10),
      y: parseInt(Elements.piecesAmountY().value, 10),
      total: null,
    };
    amount.total = amount.x * amount.y;

    if (isNaN(amount.x) || isNaN(amount.y) || amount.x < 1 || amount.y < 1) {
      Errors.add(`Please provide valid positive numbers for the piece amounts`);
      return;
    }

    if (amount.total < 2) {
      Errors.add(`The amount of pieces cannot be less than two`);
      return;
    } else if (amount.total > 5000) {
      Errors.add(`The amount of pieces cannot exceed 5000`);
      return;
    }

    Elements.solveBoxContainer().classList.add('active');
    const img = Elements.solveImg();

    /** @type {{connectingBitOffset: number, size: {x: number, y: number, connectingBitOffset: {x: number, y: number, x2: number, y2: number}}, actualSize: {x: number, y: number, connectingBitOffset: {x: number, y: number, x2: number, y2: number}}}} */
    const piece = {
      connectingBitOffset: 0.1,

      size: {
        x: img.width / amount.x,
        y: img.height / amount.y,

        connectingBitOffset: {
          x: null,
          y: null,
          x2: null,
          y2: null,
        },
      },

      actualSize: {
        x: img.naturalWidth / amount.x,
        y: img.naturalHeight / amount.y,

        connectingBitOffset: {
          x: null,
          y: null,
          x2: null,
          y2: null,
        },
      },
    };
    piece.size.connectingBitOffset.x = piece.size.x * piece.connectingBitOffset;
    piece.size.connectingBitOffset.y = piece.size.y * piece.connectingBitOffset;
    piece.size.connectingBitOffset.x2 = piece.size.connectingBitOffset.x * 2;
    piece.size.connectingBitOffset.y2 = piece.size.connectingBitOffset.y * 2;
    piece.actualSize.connectingBitOffset.x = piece.actualSize.x * piece.connectingBitOffset;
    piece.actualSize.connectingBitOffset.y = piece.actualSize.y * piece.connectingBitOffset;
    piece.actualSize.connectingBitOffset.x2 = piece.actualSize.connectingBitOffset.x * 2;
    piece.actualSize.connectingBitOffset.y2 = piece.actualSize.connectingBitOffset.y * 2;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(piece.size.x + (piece.size.connectingBitOffset.x * 2)); // One offset for each end
    canvas.height = Math.round(piece.size.y + (piece.size.connectingBitOffset.y * 2)); // One offset for each end
    const g = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

    const solveContainer = new SolveContainerElement(amount.x, amount.y);
    solveContainer.onWin(Puzzle.won);
    Elements.pieceLocationContainer().append(solveContainer);

    /**
     * @param {EdgeType} edge
     * @returns {EdgeType}
     */
    const invertEdge = (edge) => {
      if (edge === 'flat') { return 'flat'; }
      if (edge === 'bit') { return 'hole'; }
      if (edge === 'hole') { return 'bit'; }

      throw new Error(`Unknown edge to invert: '${edge}'`);
    };

    const randomEdge = () => { return Random.bool() ? 'bit' : 'hole' };

    /**
     * Traces the full outline of the piece clockwise. Dedents at a bit, and indents at a hole.
     *
     * @param {PieceTopology} topology
     */
    const tracePieceOutline = (topology) => {
      // The ordinary, non-connector part of a piece.
      const pieceCenterBoundingBox = {
        top: piece.size.connectingBitOffset.y,
        left: piece.size.connectingBitOffset.x,
        bottom: piece.size.connectingBitOffset.y + piece.size.y,
        right: piece.size.connectingBitOffset.x + piece.size.x,
      };

      /** @type {{width: number, height: number, x: {start: number, end: number}, y: {start: number, end: number}}} */
      const bit = {
        width: piece.size.x / 3,
        height: piece.size.y / 3,

        x: {
          start: null, // The x-coodinate where the bit starts
          end: null, // The x-coordinate where the bit ends
        },

        y: {
          start: null, // The y-coordinate where the bit starts
          end: null, // The y-coordinate where the bit ends
        },
      };
      bit.x.start = pieceCenterBoundingBox.left + ((piece.size.x - bit.width) / 2);
      bit.x.end = bit.x.start + bit.width;
      bit.y.start = pieceCenterBoundingBox.top + ((piece.size.y - bit.height) / 2);
      bit.y.end = bit.y.start + bit.height;

      g.beginPath();
      g.moveTo(pieceCenterBoundingBox.left, pieceCenterBoundingBox.top); // Start in top-left of piece center

      { // Top side
        g.lineTo(bit.x.start, pieceCenterBoundingBox.top); // Move to bit start at the top

        if (topology.top === 'bit') {
          g.lineTo(bit.x.start, pieceCenterBoundingBox.top - piece.size.connectingBitOffset.y);
          g.lineTo(bit.x.end, pieceCenterBoundingBox.top - piece.size.connectingBitOffset.y);
          g.lineTo(bit.x.end, pieceCenterBoundingBox.top);
        } else if (topology.top === 'hole') {
          g.lineTo(bit.x.start, pieceCenterBoundingBox.top + piece.size.connectingBitOffset.y);
          g.lineTo(bit.x.end, pieceCenterBoundingBox.top + piece.size.connectingBitOffset.y);
          g.lineTo(bit.x.end, pieceCenterBoundingBox.top);
        }

        g.lineTo(pieceCenterBoundingBox.right, pieceCenterBoundingBox.top); // Move to top-right of piece center
      }

      { // Right side
        g.lineTo(pieceCenterBoundingBox.right, bit.y.start); // Move to bit start on the right

        if (topology.right === 'bit') {
          g.lineTo(pieceCenterBoundingBox.right + piece.size.connectingBitOffset.x, bit.y.start);
          g.lineTo(pieceCenterBoundingBox.right + piece.size.connectingBitOffset.x, bit.y.end);
          g.lineTo(pieceCenterBoundingBox.right, bit.y.end);
        } else if (topology.right === 'hole') {
          g.lineTo(pieceCenterBoundingBox.right - piece.size.connectingBitOffset.x, bit.y.start);
          g.lineTo(pieceCenterBoundingBox.right - piece.size.connectingBitOffset.x, bit.y.end);
          g.lineTo(pieceCenterBoundingBox.right, bit.y.end);
        }

        g.lineTo(pieceCenterBoundingBox.right, pieceCenterBoundingBox.bottom); // Move to bottom-right of piece center
      }

      { // Bottom side
        g.lineTo(bit.x.end, pieceCenterBoundingBox.bottom); // Move to bit end on the bottom

        if (topology.bottom === 'bit') {
          g.lineTo(bit.x.end, pieceCenterBoundingBox.bottom + piece.size.connectingBitOffset.y);
          g.lineTo(bit.x.start, pieceCenterBoundingBox.bottom + piece.size.connectingBitOffset.y);
          g.lineTo(bit.x.start, pieceCenterBoundingBox.bottom);
        } else if (topology.bottom === 'hole') {
          g.lineTo(bit.x.end, pieceCenterBoundingBox.bottom - piece.size.connectingBitOffset.y);
          g.lineTo(bit.x.start, pieceCenterBoundingBox.bottom - piece.size.connectingBitOffset.y);
          g.lineTo(bit.x.start, pieceCenterBoundingBox.bottom);
        }

        g.lineTo(pieceCenterBoundingBox.left, pieceCenterBoundingBox.bottom); // Move to bottom-left of piece center
      }

      { // Left side
        g.lineTo(pieceCenterBoundingBox.left, bit.y.end); // Move to bit end on the left

        if (topology.left === 'bit') {
          g.lineTo(pieceCenterBoundingBox.left - piece.size.connectingBitOffset.x, bit.y.end);
          g.lineTo(pieceCenterBoundingBox.left - piece.size.connectingBitOffset.x, bit.y.start);
          g.lineTo(pieceCenterBoundingBox.left, bit.y.start);
        } else if (topology.left === 'hole') {
          g.lineTo(pieceCenterBoundingBox.left + piece.size.connectingBitOffset.x, bit.y.end);
          g.lineTo(pieceCenterBoundingBox.left + piece.size.connectingBitOffset.x, bit.y.start);
          g.lineTo(pieceCenterBoundingBox.left, bit.y.start);
        }

        g.lineTo(pieceCenterBoundingBox.left, pieceCenterBoundingBox.top); // Move to top-left of piece center
      }

      g.closePath();
    };

    /** @type {PieceTopology[][]} */
    const topology = [];
    for (let x = 0; x < amount.x; ++x) {
      topology[x] = [];

      for (let y = 0; y < amount.y; ++y) {
        solveContainer.addSlot(new PuzzlePieceSlotElement(x, y, piece.size.x, piece.size.y));
        topology[x].push({
          top: y === 0 ? 'flat' : invertEdge(topology[x][y - 1].bottom),
          left: x === 0 ? 'flat' : invertEdge(topology[x - 1][y].right),
          bottom: y === amount.y - 1 ? 'flat' : randomEdge(),
          right: x === amount.x - 1 ? 'flat' : randomEdge(),
        });

        g.clearRect(0, 0, canvas.width, canvas.height);

        g.save(); // Create save point before .clip()
        tracePieceOutline(topology[x][y]);
        g.clip(); // "Only render the image inside the drawn line"

        g.drawImage(
          img,

          (x * piece.actualSize.x) - piece.actualSize.connectingBitOffset.x,
          (y * piece.actualSize.y) - piece.actualSize.connectingBitOffset.y,
          piece.actualSize.x + piece.actualSize.connectingBitOffset.x2,
          piece.actualSize.y + piece.actualSize.connectingBitOffset.y2,

          0,
          0,
          canvas.width,
          canvas.height,
        );

        g.restore(); // Undo .clip(), for the next iteration

        const position = Random.position(canvas.width, canvas.height);
        const container = new PuzzlePieceContainerElement(amount.x, amount.y);
        container.moveable();
        container.setGlobalPosition(position.x, position.y);
        container.style.zIndex = document.getElementsByTagName('puzzle-piece-container').length.toString(10);
        container.addPiece(new PuzzlePieceElement(
          x, y,
          piece.size.x, piece.size.y,
          canvas.toDataURL(),
          piece.size.connectingBitOffset.x, piece.size.connectingBitOffset.y,
        ));

        Elements.pieces().append(container);
      }
    }
  },

  won: () => {
    document.getElementsByTagName('solve-container')[0].remove();
    Array.from(document.getElementsByTagName('puzzle-piece-container')).forEach(x => x.remove());

    Elements.solveBoxContainer().classList.remove('active');
  },
};

function setAmountOfPieces() {
  const x = parseInt((/** @type {HTMLInputElement} */ (document.getElementById('pieces-amount-x'))).value, 10);
  const y = parseInt((/** @type {HTMLInputElement} */ (document.getElementById('pieces-amount-y'))).value, 10);

  Elements.piecesAmount().value = (x * y).toString(10);
}

window.addEventListener('DOMContentLoaded', async () => {
  (/** @type {HTMLImageElement} */ (document.getElementById('solve-img'))).addEventListener('load', function() {
    const btn = Elements.generate();
    btn.title = '';
    btn.disabled = false;

    const img = Elements.solveImg();
    if (img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src);
    }
  });

  const piecesAmountX = Elements.piecesAmountX();
  piecesAmountX.addEventListener('input', setAmountOfPieces);
  piecesAmountX.value = "16";

  const piecesAmountY = Elements.piecesAmountY();
  piecesAmountY.addEventListener('input', setAmountOfPieces);
  piecesAmountY.value = "16";

  setAmountOfPieces();

  Elements.generate().addEventListener('click', Puzzle.generate);
  Elements.selectImage().addEventListener('click', PuzzleImage.select);

  PuzzleImage.onSelected();
  PuzzleImage.onFetched(ImageSelectModalElement._pictures[0]);
});

/** EdgeType
 * @typedef {'flat'|'bit'|'hole'} EdgeType
 */
/** PieceTopology
 * @typedef {object} PieceTopology
 * @property {EdgeType} top
 * @property {EdgeType} left
 * @property {EdgeType} bottom
 * @property {EdgeType} right
 */
