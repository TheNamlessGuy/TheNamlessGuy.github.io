Random.position = function(w, h) {
  const box = document.getElementById('solve-box').getBoundingClientRect();
  const leftSide = Random.bool();
  return {
    x: leftSide ? Random.integer(0, box.x - w) : Random.integer(box.right, document.documentElement.clientWidth - w),
    y: Random.integer(box.top, Math.clamp(box.bottom, box.bottom, document.documentElement.clientHeight - h)),
  };
};

const Errors = {
  clear: function() {
    const container = document.getElementById('errors');
    container.style.display = 'none';
    while (container.children.length > 0) { container.children[0].remove(); }
  },

  add: function(msg) {
    const container = document.getElementById('errors');
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

    const btn = document.getElementById('generate');
    btn.title = 'Image has not loaded yet';
    btn.disabled = true;
  },

  onFetched: (data) => {
    document.getElementById('solve-img').src = data.src;
    document.getElementById('selected-img-name').innerHTML = data.name;
  },

  onError: (error) => {
    document.getElementById('generate').title = 'Image could not be loaded';
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

    const amount = {
      x: parseInt(document.getElementById('pieces-amount-x').value, 10),
      y: parseInt(document.getElementById('pieces-amount-y').value, 10),
      total: null,
    };
    amount.total = amount.x * amount.y;

    if (isNaN(amount.x) || isNaN(amount.y)) {
      Errors.add(`Please provide a valid number for the piece amounts`);
      return;
    }

    if (amount.total < 2) {
      Errors.add(`The amount of pieces cannot be less than two`);
      return;
    } else if (amount.total > 99999999) {
      Errors.add(`The amount of pieces cannot exceed 100 million`);
      return;
    }

    document.getElementById('solve-box-container').classList.add('active');
    const img = document.getElementById('solve-img');

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
    canvas.width = piece.size.x + (piece.size.connectingBitOffset.x * 2); // One offset for each end
    canvas.height = piece.size.y + (piece.size.connectingBitOffset.y * 2); // One offset for each end
    canvas.widthd3 = canvas.width / 3;
    canvas.widthd3m2 = canvas.widthd3 * 2;
    canvas.heightd3 = canvas.height / 3;
    canvas.heightd3m2 = canvas.heightd3 * 2;
    const g = canvas.getContext('2d');

    const solveContainer = new SolveContainerElement(amount.x, amount.y);
    solveContainer.onWin(Puzzle.won);
    document.getElementById('piece-location-container').append(solveContainer);

    for (let x = 0; x < amount.x; ++x) {
      for (let y = 0; y < amount.y; ++y) {
        solveContainer.addSlot(new PuzzlePieceSlotElement(x, y, piece.size.x, piece.size.y));

        g.globalCompositeOperation = 'source-over';
        g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, canvas.width, canvas.height);

        if (x > 0) {
          if (x % 2 === 0) {
            // Hole on the left
            g.fillRect(0, canvas.heightd3, piece.size.connectingBitOffset.x2, canvas.heightd3);
          } else {
            // Bit on the left
            g.fillRect(0, 0, piece.size.connectingBitOffset.x2, canvas.heightd3);
            g.fillRect(0, canvas.heightd3m2, piece.size.connectingBitOffset.x2, canvas.heightd3);
          }
        }

        if (x < amount.x - 1) {
          if (x % 2 === 0) {
            // Hole on the right
            g.fillRect(canvas.width - piece.size.connectingBitOffset.x2, canvas.heightd3, piece.size.connectingBitOffset.x2, canvas.heightd3);
          } else {
            // Bit on the right
            g.fillRect(canvas.width - piece.size.connectingBitOffset.x2, 0, piece.size.connectingBitOffset.x2, canvas.heightd3);
            g.fillRect(canvas.width - piece.size.connectingBitOffset.x2, canvas.heightd3m2, piece.size.connectingBitOffset.x2, canvas.heightd3);
          }
        }

        if (y > 0) {
          if (y % 2 === 0) {
            // Hole at the top
            g.fillRect(canvas.widthd3, 0, canvas.widthd3, piece.size.connectingBitOffset.y2);
          } else {
            // Bit at the top
            g.fillRect(0, 0, canvas.widthd3, piece.size.connectingBitOffset.y2);
            g.fillRect(canvas.widthd3m2, 0, canvas.widthd3, piece.size.connectingBitOffset.y2);
          }
        }

        if (y < amount.y - 1) {
          if (y % 2 === 0) {
            // Hole at the bottom
            g.fillRect(canvas.widthd3, canvas.height - piece.size.connectingBitOffset.y2, canvas.widthd3, piece.size.connectingBitOffset.y2);
          } else {
            // Bit at the bottom
            g.fillRect(0, canvas.height - piece.size.connectingBitOffset.y2, canvas.widthd3, piece.size.connectingBitOffset.y2);
            g.fillRect(canvas.widthd3m2, canvas.height - piece.size.connectingBitOffset.y2, canvas.widthd3, piece.size.connectingBitOffset.y2);
          }
        }

        g.globalCompositeOperation = 'source-out';
        g.imageSmoothingEnabled = true;
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

        const position = Random.position(canvas.width, canvas.height);
        const container = new PuzzlePieceContainerElement(amount.x, amount.y);
        container.moveable();
        container.setPosition(position.x, position.y);
        container.style.zIndex = document.getElementsByTagName('puzzle-piece-container').length;
        container.addPiece(new PuzzlePieceElement(
          x, y,
          piece.size.x, piece.size.y,
          canvas.toDataURL(),
          piece.size.connectingBitOffset.x, piece.size.connectingBitOffset.y,
        ));
        document.getElementById('pieces').append(container);
      }
    }
  },

  won: () => {
    document.getElementsByTagName('solve-container')[0].remove();
    Array.from(document.getElementsByTagName('puzzle-piece-container')).forEach(x => x.remove());

    document.getElementById('solve-box-container').classList.remove('active');
  },
};

function setAmountOfPieces() {
  const x = parseInt(document.getElementById('pieces-amount-x').value, 10);
  const y = parseInt(document.getElementById('pieces-amount-y').value, 10);

  document.getElementById('pieces-amount').value = x * y;
}

// function loadImage(src) {
//   return new Promise((resolve) => {
//     const element = document.createElement('img');
//     element.addEventListener('load', () => {
//       resolve(element);
//     });
//     element.src = src;
//   });
// }

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('solve-img').addEventListener('load', function() {
    const btn = document.getElementById('generate');
    btn.title = '';
    btn.disabled = false;

    const img = document.getElementById('solve-img');
    if (img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src);
    }
  });

  const piecesAmountX = document.getElementById('pieces-amount-x');
  piecesAmountX.addEventListener('input', setAmountOfPieces);
  piecesAmountX.value = 16;
  const piecesAmountY = document.getElementById('pieces-amount-y');
  piecesAmountY.addEventListener('input', setAmountOfPieces);
  piecesAmountY.value = 16;
  setAmountOfPieces();

  document.getElementById('generate').addEventListener('click', Puzzle.generate);
  document.getElementById('select-image').addEventListener('click', PuzzleImage.select);

  PuzzleImage.onSelected();
  // PuzzleImage.helpers.xbit = await loadImage('images/helpers/x-bit.png');
  // PuzzleImage.helpers.xhole = await loadImage('images/helpers/x-hole.png');
  // PuzzleImage.helpers.ybit = await loadImage('images/helpers/y-bit.png');
  // PuzzleImage.helpers.yhole = await loadImage('images/helpers/y-hole.png');
  PuzzleImage.onFetched(ImageSelectModalElement._pictures[0]);
});