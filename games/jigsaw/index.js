const holdData = {
  element: null,
  listeners: {
    mousemove: null,
    mouseup: null,
  },
  grabOffset: {
    x: 0,
    y: 0,
  },
};

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
}

function addPiece(src, belongsTo, w, h, connectingBitOffset) {
  const piece = document.createElement('img');

  piece.addEventListener('mousedown', (e) => {
    if (e.button !== 0) { return; }
    e.preventDefault();
    if (!piece.classList.contains('moveable')) { return; }

    holdData.grabOffset.x = Math.abs(e.clientX - parseFloat(piece.style.left));
    holdData.grabOffset.y = Math.abs(e.clientY - parseFloat(piece.style.top));

    holdData.listeners.mouseup = () => {
      if (holdData.element != null) {
        const zIndex = parseInt(holdData.element.style.zIndex, 10);
        const pieces = document.getElementsByClassName('piece');
        Array.from(pieces).forEach((piece) => {
          const pieceZIndex = parseInt(piece.style.zIndex, 10);
          if (pieceZIndex > zIndex) {
            piece.style.zIndex = pieceZIndex - 1;
          }
        });

        holdData.element.style.zIndex = pieces.length;
        holdData.element.classList.remove('held');
        holdData.element = null;
      }

      document.removeEventListener('mousemove', holdData.listeners.mousemove);
      document.removeEventListener('mouseup', holdData.listeners.mouseup);

      slotPieceIfMatch(piece);
    };
    document.addEventListener('mouseup', holdData.listeners.mouseup);

    holdData.listeners.mousemove = (e) => {
      if (holdData.element == null) { return; }
      e.preventDefault();

      holdData.element.style.left = Math.clamp(0, e.clientX - holdData.grabOffset.x, document.documentElement.clientWidth - piece.width) + 'px';
      holdData.element.style.top = Math.clamp(0, e.clientY - holdData.grabOffset.y, document.documentElement.clientHeight - piece.height) + 'px';
    };
    document.addEventListener('mousemove', holdData.listeners.mousemove);

    holdData.element = piece;
    piece.classList.add('held');
  });

  piece.classList.add('piece', 'moveable');
  piece.src = src;
  const startingPosition = Random.position(w, h);
  piece.style.left = startingPosition.x + 'px';
  piece.style.top = startingPosition.y + 'px';
  piece.style.zIndex = document.getElementsByClassName('piece').length;
  piece.setAttribute('location', belongsTo);
  piece.setAttribute('connecting-bit-offset-x', connectingBitOffset.x);
  piece.setAttribute('connecting-bit-offset-y', connectingBitOffset.y);

  document.getElementById('pieces').append(piece);
}

function addPieceLocation(x, y, w, h) {
  const location = document.createElement('div');
  location.classList.add('location');
  location.style.position = 'absolute';
  location.style.left = (x * w) + 'px';
  location.style.top = (y * h) + 'px';
  location.style.width = w + 'px';
  location.style.height = h + 'px';
  location.id = `location-${x}x${y}`;
  document.getElementById('piece-location-container').append(location);
  return location;
}

function slotPieceIfMatch(piece) {
  const location = document.getElementById(piece.getAttribute('location'));
  const locationBox = location.getBoundingClientRect();
  const locationHitbox = {
    x1: locationBox.x + locationBox.width * 0.35,
    x2: locationBox.x + locationBox.width * 0.65,
    y1: locationBox.y + locationBox.height * 0.35,
    y2: locationBox.y + locationBox.height * 0.65,
  };

  const pieceBox = piece.getBoundingClientRect();
  const pieceCenter = {
    x: pieceBox.x + (pieceBox.width / 2),
    y: pieceBox.y + (pieceBox.height / 2),
  };

  if (
    pieceCenter.x >= locationHitbox.x1 &&
    pieceCenter.x <= locationHitbox.x2 &&
    pieceCenter.y >= locationHitbox.y1 &&
    pieceCenter.y <= locationHitbox.y2
  ) {
    const offset = {
      x: parseFloat(piece.getAttribute('connecting-bit-offset-x')),
      y: parseFloat(piece.getAttribute('connecting-bit-offset-y')),
    };

    piece.style.left = (locationBox.x - offset.x) + 'px';
    piece.style.top = (locationBox.y - offset.y) + 'px';
    piece.classList.remove('moveable');
    checkWin();
  }
}

function checkWin() {
  if (document.querySelector('img.piece.moveable') != null) { return; }

  const pieces = document.getElementById('pieces');
  while (pieces.children.length > 0) { pieces.children[0].remove(); }

  const locations = document.getElementById('piece-location-container');
  while (locations.children.length > 0) { locations.children[0].remove(); }

  document.getElementById('solve-box-container').classList.remove('active');
}

function onImageSelected() {
  Errors.clear();

  const btn = document.getElementById('generate');
  btn.title = 'Image has not loaded yet';
  btn.disabled = true;
}

function onImageFetched(data) {
  document.getElementById('solve-img').src = data.src;
  document.getElementById('selected-img-name').innerHTML = data.name;
}

function onImageError(error) {
  document.getElementById('generate').title = 'Image could not be loaded';
  Errors.add(error);
}

function selectImage() {
  ImageSelectModalElement.open({
    onSelected: onImageSelected,
    onFetched: onImageFetched,
    onError: onImageError,
  });
}

function generatePuzzle() {
  Errors.clear();

  let amount = parseInt(document.getElementById('pieces-amount').value, 10);
  if (isNaN(amount)) {
    Errors.add(`The piece amount '${document.getElementById('pieces-amount').value}' is not a valid number`);
    return;
  }

  if (amount > 99999999) {
    Errors.add(`Piece amount cannot exceed 100 million`);
    return;
  }

  amount = Math.sqrt(amount);
  if (amount % 1 !== 0) {
    Errors.add(`The piece amount must have an integer square root`);
    return;
  }

  // TODO: There is absolutely a better, more concise way of doing these functions, but I need to go to bed
  const draw = {
    center: function(g, img, x, y, piece) {
      g.drawImage(
        img,

        Math.floor(x * piece.actualSize.x),
        Math.floor(y * piece.actualSize.y),
        Math.ceil(piece.actualSize.x),
        Math.ceil(piece.actualSize.y),

        Math.floor(piece.size.connectingBitOffset.x),
        Math.floor(piece.size.connectingBitOffset.y),
        Math.ceil(piece.size.x),
        Math.ceil(piece.size.y),
      );
    },

    bit: {
      left: function(g, img, x, y, piece) {
        g.drawImage(
          img,

          Math.floor((x * piece.actualSize.x) - piece.actualSize.connectingBitOffset.x),
          Math.floor((y * piece.actualSize.y) + (piece.actualSize.y / 4)),
          Math.ceil(piece.actualSize.connectingBitOffset.x),
          Math.ceil(piece.actualSize.y / 2),

          0,
          Math.floor(piece.size.connectingBitOffset.y + (piece.size.y / 4)),
          Math.ceil(piece.size.connectingBitOffset.x),
          Math.ceil(piece.size.y / 2),
        );
      },

      right: function(g, img, x, y, piece) {
        g.drawImage(
          img,

          Math.floor((x * piece.actualSize.x) + piece.actualSize.x),
          Math.floor((y * piece.actualSize.y) + (piece.actualSize.y / 4)),
          Math.ceil(piece.actualSize.connectingBitOffset.x),
          Math.ceil(piece.actualSize.y / 2),

          piece.size.x + piece.size.connectingBitOffset.x, // For the left offset
          piece.size.connectingBitOffset.y + (piece.size.y / 4),
          Math.ceil(piece.size.connectingBitOffset.x),
          Math.ceil(piece.size.y / 2),
        );
      },

      top: function(g, img, x, y, piece) {
        g.drawImage(
          img,

          Math.floor((x * piece.actualSize.x) + (piece.actualSize.x / 4)),
          Math.floor((y * piece.actualSize.y) - piece.actualSize.connectingBitOffset.y),
          Math.ceil(piece.actualSize.x / 2),
          Math.ceil(piece.actualSize.connectingBitOffset.y),

          Math.floor(piece.size.connectingBitOffset.x + (piece.size.x / 4)),
          0,
          Math.ceil(piece.size.x / 2),
          Math.ceil(piece.size.connectingBitOffset.y),
        );
      },

      bottom: function(g, img, x, y, piece) {
        g.drawImage(
          img,

          Math.floor((x * piece.actualSize.x) + (piece.actualSize.x / 4)),
          Math.floor((y * piece.actualSize.y) + piece.actualSize.y),
          Math.ceil(piece.actualSize.x / 2),
          Math.ceil(piece.actualSize.connectingBitOffset.y),

          Math.floor(piece.size.connectingBitOffset.x + (piece.size.x / 4)),
          Math.floor(piece.size.y + piece.size.connectingBitOffset.y),
          Math.ceil(piece.size.x / 2),
          Math.ceil(piece.size.connectingBitOffset.y),
        );
      },
    },

    hole: {
      left: function(g, piece) {
        g.clearRect(
          Math.floor(piece.size.connectingBitOffset.x),
          Math.floor(piece.size.connectingBitOffset.y + (piece.size.y / 4)),
          Math.ceil(piece.size.connectingBitOffset.x),
          Math.ceil(piece.size.y / 2),
        );
      },

      right: function(g, piece) {
        g.clearRect(
          Math.floor(piece.size.x), // piece.size.x + piece.size.connectingBitOffset.x - piece.size.connectingBitOffset.x
          Math.floor(piece.size.connectingBitOffset.y + (piece.size.y / 4)),
          Math.ceil(piece.size.connectingBitOffset.x),
          Math.ceil(piece.size.y / 2),
        );
      },

      top: function(g, piece) {
        g.clearRect(
          Math.floor(piece.size.connectingBitOffset.x + (piece.size.x / 4)),
          Math.floor(piece.size.connectingBitOffset.y),
          Math.ceil(piece.size.x / 2),
          Math.ceil(piece.size.connectingBitOffset.y),
        );
      },

      bottom: function(g, piece) {
        g.clearRect(
          Math.floor(piece.size.connectingBitOffset.x + (piece.size.x / 4)),
          Math.floor(piece.size.y), // piece.size.y + piece.size.connectingBitOffset.y - piece.size.connectingBitOffset.y
          Math.ceil(piece.size.x / 2),
          Math.ceil(piece.size.connectingBitOffset.y),
        );
      },
    },
  };

  document.getElementById('solve-box-container').classList.add('active');
  const img = document.getElementById('solve-img');

  const piece = {
    connectingBitOffset: 0.2,

    size: {
      x: img.width / amount,
      y: img.height / amount,

      connectingBitOffset: {
        x: null,
        y: null,
      },
    },

    actualSize: {
      x: img.naturalWidth / amount,
      y: img.naturalHeight / amount,

      connectingBitOffset: {
        x: null,
        y: null,
      },
    },
  };
  piece.size.connectingBitOffset.x = piece.size.x * piece.connectingBitOffset;
  piece.size.connectingBitOffset.y = piece.size.y * piece.connectingBitOffset;
  piece.actualSize.connectingBitOffset.x = piece.actualSize.x * piece.connectingBitOffset;
  piece.actualSize.connectingBitOffset.y = piece.actualSize.y * piece.connectingBitOffset;

  const canvas = document.createElement('canvas');
  canvas.width = piece.size.x + (piece.size.connectingBitOffset.x * 2); // One offset for each end
  canvas.height = piece.size.y + (piece.size.connectingBitOffset.y * 2); // One offset for each end
  const g = canvas.getContext('2d');

  for (let x = 0; x < amount; ++x) {
    for (let y = 0; y < amount; ++y) {
      g.clearRect(0, 0, canvas.width, canvas.height);

      draw.center(g, img, x, y, piece);

      if (x > 0) {
        if (x % 2 === 0) {
          draw.hole.left(g, piece);
        } else {
          draw.bit.left(g, img, x, y, piece);
        }
      }

      if (x < amount - 1) {
        if (x % 2 === 0) {
          draw.hole.right(g, piece);
        } else {
          draw.bit.right(g, img, x, y, piece);
        }
      }

      if (y > 0) {
        if (y % 2 === 0) {
          draw.hole.top(g, piece);
        } else {
          draw.bit.top(g, img, x, y, piece);
        }
      }

      if (y < amount - 1) {
        if (y % 2 === 0) {
          draw.hole.bottom(g, piece);
        } else {
          draw.bit.bottom(g, img, x, y, piece);
        }
      }

      const location = addPieceLocation(x, y, piece.size.x, piece.size.y);
      addPiece(canvas.toDataURL(), location.id, canvas.width, canvas.height, piece.size.connectingBitOffset);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('solve-img').addEventListener('load', function() {
    const btn = document.getElementById('generate');
    btn.title = '';
    btn.disabled = false;

    const img = document.getElementById('solve-img');
    if (img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src);
    }
  });

  document.getElementById('pieces-amount').value = 25;
  document.getElementById('generate').addEventListener('click', generatePuzzle);
  document.getElementById('select-image').addEventListener('click', selectImage);

  onImageSelected();
  onImageFetched(ImageSelectModalElement._pictures[0]);
});