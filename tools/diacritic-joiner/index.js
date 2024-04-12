// Codes shamelessly stolen from https://github.com/combatwombat/Lunicode.js/blob/master/lunicode.js#L346
// Names stolen from https://en.wikipedia.org/wiki/Diacritical_mark
// Offsets stolen from my eyes (good enough at least)
const DIACRITICS = {
  top: [
    {code: 768, name: 'Grave accent'},
    {code: 769, name: 'Acute accent'},
    {code: 770, name: 'Circumflex accent'},
    {code: 771, name: 'Tilde'},
    {code: 772, name: 'Macron'},
    {code: 773, name: 'Overline'},
    {code: 774, name: 'Breve'},
    {code: 775, name: 'Dot above'},
    {code: 776, name: 'Diaeresis'},
    {code: 777, name: 'Hook above'},
    {code: 778, name: 'Ring above'},
    {code: 779, name: 'Double acute accent'},
    {code: 780, name: 'Caron'},
    {code: 781, name: 'Vertical line above'},
    {code: 782, name: 'Double vertical line above'},
    {code: 783, name: 'Double grave accent'},
    {code: 784, name: 'Candrabindu'},
    {code: 785, name: 'Inverted breve'},
    {code: 786, name: 'Turned comma above'},
    {code: 787, name: 'Comma above'},
    {code: 788, name: 'Reversed comma above'},
    {code: 789, name: 'Comma above right'},

    {code: 794, name: 'Left angle above'},
    {code: 795, name: 'Horn'},

    {code: 829, name: 'X above'},
    {code: 830, name: 'Vertical tilde'},
    {code: 831, name: 'Double overline'},
    {code: 832, name: 'Grave tone mark'},
    {code: 833, name: 'Acute tone mark'},
    {code: 834, name: 'Greek perispomeni'}, // Apparently technically not a diacritical mark, but whatever
    {code: 835, name: 'Greek koronis'}, // Apparently technically not a diacritical mark, but whatever
    {code: 836, name: 'Greek dialytika tonos'}, // Apparently technically not a diacritical mark, but whatever

    {code: 838, name: 'Bridge above'},

    {code: 848, name: 'Right arrowhead above'},
    {code: 849, name: 'Left half ring above'},
    {code: 850, name: 'Fermata'},

    {code: 855, name: 'Right half ring above'},
    {code: 856, name: 'Dot above right'},

    {code: 859, name: 'Zigzag above'},

    {code: 861, name: 'Double breve'},
    {code: 862, name: 'Double macron'},

    {code: 864, name: 'Double tilde'},
    {code: 865, name: 'Double inverted breve'},
  ],

  middle: [
    {code: 820, name: 'Tilde overlay'},
    {code: 821, name: 'Short stroke overlay'},
    {code: 822, name: 'Long stroke overlay'},
    {code: 823, name: 'Short solidus overlay'},
    {code: 824, name: 'Long solidus overlay'},
  ],

  bottom: [
    {code: 790, name: 'Grave accent below'},
    {code: 791, name: 'Acute accent below'},
    {code: 792, name: 'Left tack below'},
    {code: 793, name: 'Right tack below'},

    {code: 796, name: 'Left half ring below'},
    {code: 797, name: 'Up tack below'},
    {code: 798, name: 'Down tack below'},
    {code: 799, name: 'Plus sign below'},
    {code: 800, name: 'Minus sign below'},
    {code: 801, name: 'Palatalized hook below'},
    {code: 802, name: 'Retroflex hook below'},
    {code: 803, name: 'Dot below'},
    {code: 804, name: 'Diaeresis below'},
    {code: 805, name: 'Ring below'},
    {code: 806, name: 'Comma below'},
    {code: 807, name: 'Cedilla'},
    {code: 808, name: 'Ogonek'},
    {code: 809, name: 'Vertical line below'},
    {code: 810, name: 'Bridge below'},
    {code: 811, name: 'Inverted double arch below'},
    {code: 812, name: 'Caron below'},
    {code: 813, name: 'Circumflex accent below'},
    {code: 814, name: 'Breve below'},
    {code: 815, name: 'Inverted breve below'},
    {code: 816, name: 'Tilde below'},
    {code: 817, name: 'Macron below'},
    {code: 818, name: 'Low line'},
    {code: 819, name: 'Double low line'},

    {code: 825, name: 'Right half ring below'},
    {code: 826, name: 'Inverted bridge below'},
    {code: 827, name: 'Square below'},
    {code: 828, name: 'Seagull below'},

    {code: 837, name: 'Greek ypogegrammeni'},

    {code: 839, name: 'Equals sign below'},
    {code: 840, name: 'Double vertical line below'},
    {code: 841, name: 'Left angle below'},

    {code: 845, name: 'Left right arrow below'},
    {code: 846, name: 'Upwards arrow below'},

    {code: 851, name: 'X below'},
    {code: 852, name: 'Left arrowhead below'},
    {code: 853, name: 'Right arrowhead below'},
    {code: 854, name: 'Right arrowhead and up arrowhead below'},

    {code: 857, name: 'Asterisk below'},
    {code: 858, name: 'Double ring below'},

    {code: 860, name: 'Double breve below'},

    {code: 863, name: 'Double macron below'},
  ],
}

function createDiacritic(i) {
  const container = document.createElement('div');
  container.id = i.code;
  container.title = i.name;
  container.classList.add('diacritic-container');
  container.addEventListener('click', (e) => {
    if (e.ctrlKey) {
      openDiacriticModal(i);
    } else {
      onDiacriticClicked(i.code);
    }
  });

  const diacritic = document.createElement('span');
  diacritic.classList.add('diacritic', 'flex', 'space-around', 'align-center');
  diacritic.innerText = '◌' + String.fromCharCode(i.code);
  container.append(diacritic);

  return container;
}

let CHAR = 'A';
function setChar(c) {
  CHAR = c;
  setDiacritics();
}

function setDiacritics() {
  let char = CHAR;

  const active = Array.from(document.querySelectorAll('.diacritic-container.active')).sort((a, b) => a.index - b.index);
  for (const diacritic of active) {
    char += String.fromCharCode(parseInt(diacritic.id));
  }

  document.getElementById('character').innerText = char;
}

function onDiacriticClicked(i) {
  const element = document.getElementById(i);
  const wasActive = element.classList.contains('active');
  element.classList.toggle('active');

  const active = Array.from(document.querySelectorAll('.diacritic-container.active')).sort((a, b) => a.index - b.index);
  if (wasActive) {
    // Correct all the indexes
    for (const a of active) {
      if (a.index >= element.index) {
        a.index -= 1;
      }
    }

    element.index = null;
  } else {
    element.index = active.length;
  }

  setDiacritics();
}

function openDiacriticModal(diacritic) {
  document.getElementById('modal-title').innerText = diacritic.name;
  document.getElementById('modal-diacritic').innerText = '◌' + String.fromCharCode(diacritic.code);
  document.getElementById('modal-description').innerHTML = diacritic.description ?? 'The usage of this diacritic has not yet been specified.';
  document.getElementById('modal-container').classList.remove('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal').addEventListener('click', (e) => e.stopPropagation());
  document.getElementById('modal-container').addEventListener('click', () => document.getElementById('modal-container').classList.add('hidden'));

  window.addEventListener('keyup', (e) => {
    if (e.key.length !== 1 || e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }

    const code = e.key.charCodeAt(0);
    if (code >= 65 && code <= 90) { // Uppercase
      setChar(e.key);
    } else if (code >= 97 && code <= 122) { // Lowercase
      setChar(e.key);
    }
  });

  let container = document.getElementById('diacritics-container-above');
  for (const c of DIACRITICS.top) {
    container.append(createDiacritic(c));
  }

  container = document.getElementById('diacritics-container-middle');
  for (const c of DIACRITICS.middle) {
    container.append(createDiacritic(c));
  }

  container = document.getElementById('diacritics-container-below');
  for (const c of DIACRITICS.bottom) {
    container.append(createDiacritic(c));
  }
});