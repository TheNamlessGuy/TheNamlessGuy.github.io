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

Math.clamp = function clamp(min, value, max) {
  if (value < min) { return min; }
  if (value > max) { return max; }
  return value;
}

const Random = {
  bool: function() { return Math.random() < 0.5; },
  number: function(min, max) { return Math.floor(Math.random() * (max - min + 1) + min); },
  position: function(w, h) {
    const box = document.getElementById('solve-box').getBoundingClientRect();
    const leftSide = Random.bool();
    return {
      x: leftSide ? Random.number(0, box.x - w) : Random.number(box.right, document.documentElement.clientWidth - w),
      y: Random.number(box.top, Math.clamp(box.bottom, box.bottom, document.documentElement.clientHeight - h)),
    };
  },
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

function addPiece(src, belongsTo, w, h) {
  const piece = document.createElement('img');

  piece.addEventListener('mousedown', (e) => {
    if (e.button !== 0) { return; }
    e.preventDefault();
    if (!piece.classList.contains('moveable')) { return; }

    holdData.grabOffset.x = Math.abs(e.clientX - parseFloat(piece.style.left));
    holdData.grabOffset.y = Math.abs(e.clientY - parseFloat(piece.style.top));

    holdData.listeners.mouseup = () => {
      holdData.element?.classList.remove('held');
      holdData.element = null;
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
  piece.setAttribute('location', belongsTo);

  document.getElementById('pieces').append(piece);
}

function addPieceLocation(x, y, w, h) {
  const location = document.createElement('div');
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
    piece.style.left = locationBox.x + 'px';
    piece.style.top = locationBox.y + 'px';
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

  amount = Math.sqrt(amount);
  if (amount % 1 !== 0) {
    Errors.add(`The piece amount must have an integer square root`);
    return;
  }

  document.getElementById('solve-box-container').classList.add('active');
  const img = document.getElementById('solve-img');

  const canvas = document.createElement('canvas');
  canvas.width = img.width / amount;
  canvas.height = img.height / amount;
  const g = canvas.getContext('2d');

  const actualWidth = img.naturalWidth / amount;
  const actualHeight = img.naturalHeight / amount;

  for (let x = 0; x < amount; ++x) {
    for (let y = 0; y < amount; ++y) {
      g.drawImage(img, x * actualWidth, y * actualHeight, actualWidth, actualHeight, 0, 0, canvas.width, canvas.height);
      const location = addPieceLocation(x, y, canvas.width, canvas.height);
      addPiece(canvas.toDataURL(), location.id, canvas.width, canvas.height);
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