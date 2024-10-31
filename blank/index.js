const Cursor = {
  timeout: null,
  hide: function(fadeIn = true) {
    if (Cursor.timeout != null) {
      clearTimeout(Cursor.timeout);
    }

    if (fadeIn !== false) { Cursor.fadePrompt(false); }
    document.body.classList.remove('hidden-cursor');

    if (Options.dialog.isOpen) { return; }

    Cursor.timeout = setTimeout(() => {
      document.body.classList.add('hidden-cursor');
      Cursor.fadePrompt(true);
    }, 1000);
  },

  fadePrompt: function(out) {
    const prompt = document.getElementById('prompt');

    const listener = () => {
      prompt.style.display = out ? 'none' : null;
      prompt.removeEventListener('animationend', listener);
    };
    prompt.addEventListener('animationend', listener);

    prompt.style.display = null;
    prompt.classList.remove(out ? 'fade-in' : 'fade-out');
    prompt.classList.add(out ? 'fade-out' : 'fade-in');
  },
}

const Options = {
  setBackgroundColor: function() {
    const color = document.getElementById('options-color').value;
    document.body.style.backgroundColor = color;
    document.getElementById('prompt').style.color = color;
  },

  dialog: {
    init: function() {
      document.getElementById('options-color').addEventListener('input', Options.setBackgroundColor);
      document.getElementById('options-color').addEventListener('change', Options.setBackgroundColor);
      document.getElementById('options-x-btn').addEventListener('click', Options.dialog.hide);
      Options.dialog.get().addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          Options.dialog.hide();
        }
      });
    },

    isOpen: false,
    show: function() {
      if (Options.dialog.isOpen) { return; }

      Options.dialog.isOpen = true;
      Cursor.hide();
      Options.dialog.get().showModal();
    },

    hide: function() {
      if (!Options.dialog.isOpen) { return; }

      Options.dialog.isOpen = false;
      Cursor.hide(false);
      Options.dialog.get().close();
    },

    toggle: function() {
      if (Options.dialog.isOpen) {
        Options.dialog.hide();
      } else {
        Options.dialog.show();
      }
    },

    get: function() { return document.getElementById('options-dialog'); },
  },
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.body.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  Options.dialog.init();
  Options.setBackgroundColor();

  window.addEventListener('keyup', (e) => {
    if (e.key === 'f') {
      toggleFullscreen();
    } else if (e.key === 'F1') {
      Options.dialog.toggle();
    } else if (e.key === 'Escape') {
      Options.dialog.hide();
    }
  });

  window.addEventListener('mousemove', Cursor.hide);
  Cursor.hide(false);
});