const letters = {
  'a': 'res/a.gif',
  'b': 'res/b.gif',
  'c': 'res/c.gif',
  'd': 'res/d.gif',
  'e': 'res/e.gif',
  'f': 'res/f.gif',
  'g': 'res/g.gif',
  'h': 'res/h.gif',
  'i': 'res/i.gif',
  'j': 'res/j.gif',
  'k': 'res/k.gif',
  'l': 'res/l.gif',
  'm': 'res/m.gif',
  'n': 'res/n.gif',
  'o': 'res/o.gif',
  'p': 'res/p.gif',
  'q': 'res/q.gif',
  'r': 'res/r.gif',
  's': 'res/s.gif',
  't': 'res/t.gif',
  'u': 'res/u.gif',
  'v': 'res/v.gif',
  'w': 'res/w.gif',
  'x': 'res/x.gif',
  'y': 'res/y.gif',
  'z': 'res/z.gif',
  '0': 'res/0.gif',
  '1': 'res/1.gif',
  '2': 'res/2.gif',
  '3': 'res/3.gif',
  '4': 'res/4.gif',
  '5': 'res/5.gif',
  '6': 'res/6.gif',
  '7': 'res/7.gif',
  '8': 'res/8.gif',
  '9': 'res/9.gif',
  '@': 'res/at.gif',
  '&': 'res/amp.gif',
  '$': 'res/dollar.gif',
  '!': 'res/em.gif',
  '?': 'res/qm.gif',
};

function dancetime() {
  const dancefloor = document.getElementById('dancefloor');
  while (dancefloor.lastChild) {
    dancefloor.removeChild(dancefloor.lastChild);
  }

  const text = document.getElementById('textarea').value.toLowerCase();
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
      img.src = letters[c];
      dancefloor.appendChild(img);
    }

    lastWasNewline = c === '\n';
  }
}

window.addEventListener('load', () => {
  document.getElementById('generate-btn').addEventListener('click', dancetime);
});