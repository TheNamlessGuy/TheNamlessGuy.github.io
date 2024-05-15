const letters = {
  'a': {src: 'res/a.gif'},
  'b': {src: 'res/b.gif'},
  'c': {src: 'res/c.gif'},
  'd': {src: 'res/d.gif'},
  'e': {src: 'res/e.gif'},
  'f': {src: 'res/f.gif'},
  'g': {src: 'res/g.gif'},
  'h': {src: 'res/h.gif'},
  'i': {src: 'res/i.gif'},
  'j': {src: 'res/j.gif'},
  'k': {src: 'res/k.gif'},
  'l': {src: 'res/l.gif'},
  'm': {src: 'res/m.gif'},
  'n': {src: 'res/n.gif'},
  'o': {src: 'res/o.gif'},
  'p': {src: 'res/p.gif'},
  'q': {src: 'res/q.gif'},
  'r': {src: 'res/r.gif'},
  's': {src: 'res/s.gif'},
  't': {src: 'res/t.gif'},
  'u': {src: 'res/u.gif'},
  'v': {src: 'res/v.gif'},
  'w': {src: 'res/w.gif'},
  'x': {src: 'res/x.gif'},
  'y': {src: 'res/y.gif'},
  'z': {src: 'res/z.gif'},
  '0': {src: 'res/0.gif'},
  '1': {src: 'res/1.gif'},
  '2': {src: 'res/2.gif'},
  '3': {src: 'res/3.gif'},
  '4': {src: 'res/4.gif'},
  '5': {src: 'res/5.gif'},
  '6': {src: 'res/6.gif'},
  '7': {src: 'res/7.gif'},
  '8': {src: 'res/8.gif'},
  '9': {src: 'res/9.gif'},
  '@': {src: 'res/at.gif'},
  '&': {src: 'res/amp.gif'},
  '$': {src: 'res/dollar.gif'},
  '!': {src: 'res/em.gif'},
  '?': {src: 'res/qm.gif'},
};

function dancetime() {
  const dancefloor = document.getElementById('dancefloor');
  while (dancefloor.lastChild) {
    dancefloor.removeChild(dancefloor.lastChild);
  }

  const text = document.getElementById('input').value.toLowerCase();
  let lastWasNewline = false;
  for (const c of text) {
    if (c === ' ') {
      const buffer = document.createElement('span');
      buffer.classList.add('letter');
      dancefloor.appendChild(buffer);
    } else if (c === '\n') {
      dancefloor.appendChild(document.createElement('br'));
      if (lastWasNewline) {
        const buffer = document.createElement('div');
        buffer.classList.add('letter');
        dancefloor.appendChild(buffer);
      }
    } else if (c in letters) {
      const img = document.createElement('img');
      img.classList.add('letter');
      img.src = letters[c].src;
      dancefloor.appendChild(img);
    }

    lastWasNewline = c === '\n';
  }
}

function exporttime() {
  alert('How did you get here?');
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate').addEventListener('click', dancetime);
  document.getElementById('export').addEventListener('click', exporttime);
});