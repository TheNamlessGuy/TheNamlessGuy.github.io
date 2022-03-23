const BASE_PAGE_TITLE = 'YouTube player - Namless Things';

const LOOP_TYPE = {
  one: 1,
  all: 2,
  once: 3,
  dont: 4,
};

const CURRENT_URL = {
  value: null,

  load: function() {
    if (this.playlist() != null) {
      PLAYLISTS.load(this.playlist());
    }

    const idx = this.idx();
    if (idx) { CURRENT_ENTRY.set(idx); }
  },

  _set: function(key, value) {
    if (value === null) {
      this.value.searchParams.delete(key);
    } else {
      this.value.searchParams.set(key, value);
    }

    window.history.replaceState(null, null, this.value.href);
    return value;
  },

  _get: function(key) {
    return this.value.searchParams.get(key);
  },

  _getOrSet: function(key, value) {
    if (value === undefined) {
      return this._get(key);
    }

    return this._set(key, value);
  },

  playlist: function(value = undefined) {
    return this._getOrSet('playlist', value);
  },

  idx: function(value = undefined) {
    return this._getOrSet('idx', value);
  },

  loopType: function(value = undefined) {
    let retval = this._getOrSet('loop', value);
    if (retval == null) {
      return retval;
    }
    return parseInt(retval, 10);
  },
};

const PLAYLISTS = {
  map: {},

  add: function(id, data) {
    this.map[id] = data;
  },

  get: function(id) {
    return this.map[id];
  },

  randomDefault: function() {
    const list = this.map['memes'];
    return list[Math.floor(Math.random() * list.length)]
  },

  load: function(id) {
    this.loadData(this.get(id), false);
  },

  loadData: function(data, externalSource) {
    ENTRIES.clear();

    for (const entry of data) {
      ENTRIES.load(entry.id, entry.title);
    }

    if (externalSource) {
      this._setupAfterExternalSource();
    }
  },

  _setupAfterExternalSource: async function() {
    await YOUTUBE.sleepUntilInitialized();
    CURRENT_ENTRY.set(0);
    YOUTUBE.load(ENTRIES.getID(0));
    CURRENT_URL.playlist(null);
  },

  save: function() {
    let link = "javascript:PLAYLISTS.loadData([";

    for (let i = 0; i < ENTRIES.list.length; ++i) {
      if (i > 0) { link += ','; }
      link += JSON.stringify({id: ENTRIES.getID(i), title: ENTRIES.getTitle(i)});
    }

    link += "], true);";

    const displayElem = document.getElementById('save-link');
    displayElem.href = link;
    displayElem.classList.remove('hidden');
  },
};

const ENTRIES = {
  container: null,
  list: [],

  create: function(insertAtIdx = null) {
    const entry = initTemplate(TEMPLATES.entry);

    if (ENTRIES.list.length === 0) {
      const elem = entry.getElementsByClassName('minus-button')[0];
      elem.classList.add('invisible');
      elem.disabled = true;
    }

    let idx = ENTRIES.list.length;
    if (insertAtIdx !== null) {
      idx = insertAtIdx;

      ENTRIES.container.insertBefore(entry, ENTRIES.list[idx]);
      ENTRIES.list.splice(idx, 0, entry);

      for (let i = idx; i < this.list.length; ++i) {
        this.list[i].getElementsByClassName('entry-index')[0].innerHTML = i + 1;
      }

      if (CURRENT_ENTRY.idx >= idx) {
        CURRENT_ENTRY.set(CURRENT_ENTRY.idx + 1);
      }
    } else {
      ENTRIES.container.appendChild(entry);
      ENTRIES.list.push(entry);

      entry.getElementsByClassName('entry-index')[0].innerHTML = idx + 1;
    }

    entry.getElementsByClassName('play-button')[0].addEventListener('click', () => {
      CONTROLS.play(parseInt(entry.getElementsByClassName('entry-index')[0].innerText, 10) - 1);
    });
    entry.getElementsByClassName('plus-button')[0].addEventListener('click', () => {
      ENTRIES.create(parseInt(entry.getElementsByClassName('entry-index')[0].innerText, 10));
    });
    entry.getElementsByClassName('minus-button')[0].addEventListener('click', () => {
      ENTRIES.remove(parseInt(entry.getElementsByClassName('entry-index')[0].innerText, 10) - 1);
    });

    const titleElem = entry.getElementsByClassName('entry-title')[0];
    titleElem.addEventListener('keyup', (e) => e.stopPropagation());
    titleElem.addEventListener('blur', () => {
      const idx = parseInt(entry.getElementsByClassName('entry-index')[0].innerText, 10) - 1;
      if (idx === CURRENT_ENTRY.idx) {
        setPageTitle(titleElem.value, true);
      }
    });

    return {entry, idx};
  },

  load: function(id, title) {
    const data = this.create();
    data.entry.getElementsByClassName('entry-id')[0].value = id;
    this.setTitle(data.idx, title);
  },

  remove: function(idx) {
    ENTRIES.container.removeChild(this.list[idx]);
    this.list.splice(idx, 1);

    for (let i = idx; i < this.list.length; ++i) {
      this.list[i].getElementsByClassName('entry-index')[0].innerHTML = i + 1;
    }

    if (CURRENT_ENTRY.idx === idx && idx < ENTRIES.list.length) {
      CURRENT_ENTRY.set(CURRENT_ENTRY.idx);
    } else if (CURRENT_ENTRY.idx > idx) {
      CURRENT_ENTRY.set(CURRENT_ENTRY.idx - 1);
    }
  },

  clear: function() {
    while (this.list.length > 0) {
      this.remove(this.list.length - 1);
    }
  },

  markAsUnavailable: function(idx) {
    this.list[idx].classList.add('unavailable');
  },

  markAsAvailable: function(idx) {
    this.list[idx].classList.remove('unavailable');
  },

  setTitle: function(idx, title) {
    if (this.getID(idx) === '') { return; }

    const elem = this.list[idx].getElementsByClassName('entry-title')[0];
    if (elem.value === '' || elem.value === null) {
      elem.value = title;
    }

    elem.style.width = Math.max(24, elem.value.length) + 'ch';
    return elem.value;
  },

  getTitle: function(idx) {
    return this.list[idx].getElementsByClassName('entry-title')[0].value;
  },

  getID: function(idx) {
    return this.list[idx].getElementsByClassName('entry-id')[0].value;
  }
}

const TEMPLATES = {
  entry: null,
};

const CURRENT_ENTRY = {
  idx: null,

  set: function(idx) {
    document.getElementsByClassName('current')[0]?.classList.remove('current');

    this.idx = ENTRIES.list.length === 0 ? 0 : (idx % ENTRIES.list.length);
    if (this.idx < 0) {
      this.idx = ENTRIES.list.length - 1 + this.idx;
    }

    ENTRIES.list[this.idx]?.classList.add('current');

    CURRENT_URL.idx(this.idx);
    return this.idx;
  },
};

const CONTROLS = {
  play: function(idx) {
    idx = CURRENT_ENTRY.set(idx);

    let id = ENTRIES.getID(idx);
    if (id === null || id === '') {
      id = PLAYLISTS.randomDefault().id;
    }

    YOUTUBE.load(id);
  },

  playToggle: function() {
    if (YOUTUBE.playing) {
      YOUTUBE.pause();
    } else {
      YOUTUBE.play();
    }
  },

  resetCurrent: function() {
    const wasPlaying = YOUTUBE.playing;
    YOUTUBE.stop();
    if (wasPlaying) { YOUTUBE.play(); }
  },

  next: function(loopType = null) {
    if (loopType === null) { loopType = CURRENT_URL.loopType(); }

    if (loopType === LOOP_TYPE.all) {
      this.play(CURRENT_ENTRY.idx + 1);
    } else if (loopType === LOOP_TYPE.one) {
      this.play(CURRENT_ENTRY.idx);
    } else if (loopType === LOOP_TYPE.once) {
      if (CURRENT_ENTRY.idx + 1 < ENTRIES.list.length) {
        this.play(CURRENT_ENTRY.idx + 1);
      }
    }
  },

  previous: function(loopType = null) {
    if (loopType === null) { loopType = CURRENT_URL.loopType(); }

    if (loopType === LOOP_TYPE.all) {
      this.play(CURRENT_ENTRY.idx - 1);
    } else if (loopType === LOOP_TYPE.one) {
      this.play(CURRENT_ENTRY.idx);
    } else if (loopType === LOOP_TYPE.once) {
      if (CURRENT_ENTRY.idx - 1 >= 0) {
        this.play(CURRENT_ENTRY.idx - 1);
      }
    }
  },
};

const YOUTUBE = {
  player: null,
  playing: false,

  initialized: false,

  init: function() {
    this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this),
        'onError': this.onPlayerError.bind(this),
      },
      playerVars: {
        disablekb: 1,
        // TODO: Figure out how the fuck playerVars.autoplay works (or doesn't)
      },
    });

    this.initialized = true;
  },

  load: function(id) {
    this.player.loadVideoById(id, 0, 'large');
  },

  play: function() {
    this.playing = true;
    this.player.playVideo();
  },

  pause: function() {
    this.playing = false;
    this.player.pauseVideo();
  },

  stop: function() {
    this.playing = false;
    this.player.stopVideo();
  },

  onPlayerReady: function() {
    if (!this.loaded()) {
      const id = ENTRIES.getID(CURRENT_ENTRY.idx);
      if (id) { this.load(id); }
    } else if (this.playing) {
      this.play();
    }
  },

  onPlayerError: function(event) {
    if (event.data === 101 || event.data === 150) { // Same thing
      // Video is unavailable
      ENTRIES.markAsUnavailable(CURRENT_ENTRY.idx);
      CONTROLS.next();
    }
  },

  onPlayerStateChange: function(event) {
    if (event.data === YT.PlayerState.UNSTARTED && this.title() !== '') {
      const title = ENTRIES.setTitle(CURRENT_ENTRY.idx, this.title());
      setPageTitle(title, true);
    } else if (event.data === YT.PlayerState.ENDED) {
      CONTROLS.next();
    } else if (event.data === YT.PlayerState.PLAYING) {
      ENTRIES.markAsAvailable(CURRENT_ENTRY.idx);
      const title = ENTRIES.setTitle(CURRENT_ENTRY.idx, this.title());
      setPageTitle(title, true);
    }
  },

  loaded: function() {
    return this.player.getVideoData().video_id;
  },

  title: function() {
    return this.player.getVideoData().title;
  },

  sleepUntilInitialized: async function() {
    await HELPERS.sleepUntil(() => this.initialized);
  },
};

const HELPERS = {
  randomInt: function(start, interval = 500) {
    return start + Math.floor(Math.random() * (interval + 1));
  },

  sleep: function(time, offset = 500) {
    return new Promise((resolve) => setTimeout(resolve, this.randomInt(time, offset)));
  },

  sleepUntil: async function(cond, interval = 500) {
    while (true) {
      await this.sleep(interval, 0);
      let finished = await Promise.resolve(cond());
      if (finished) { return; }
    }
  },
};

function helperEventHandler(e) {
  const data = JSON.parse(e.detail);
  if (data.action === 'setup-playlist') {
    PLAYLISTS.loadData(data.ids, true);
  }
}

function init() {
  document.addEventListener('youtube-player-helper', helperEventHandler);

  TEMPLATES.entry = document.getElementById('entry-template');
  ENTRIES.container = document.getElementById('entry-list');
  CURRENT_URL.value = new URL(window.location.href);

  CURRENT_URL.load();

  if (CURRENT_URL.loopType() === null) {
    CURRENT_URL.loopType(LOOP_TYPE.all);
  }

  if (ENTRIES.list.length === 0) {
    ENTRIES.create();
  }

  if (CURRENT_ENTRY.idx === null) {
    CURRENT_ENTRY.set(0);
  }

  const loopTypeElem = document.getElementById('loop-type');
  loopTypeElem.value = CURRENT_URL.loopType();
  loopTypeElem.addEventListener('change', () => {
    CURRENT_URL.loopType(loopTypeElem.value);
  });

  document.getElementById('save-button').addEventListener('click', () => { PLAYLISTS.save(); });

  const playlistElem = document.getElementById('playlists');
  if (CURRENT_URL.playlist()) {
    playlistElem.value = CURRENT_URL.playlist();
  }
  playlistElem.addEventListener('change', () => {
    if (playlistElem.value === '') {
      return;
    }

    CURRENT_URL.playlist(playlistElem.value);
    PLAYLISTS.load(playlistElem.value);
    CURRENT_ENTRY.set(0);
    YOUTUBE.load(ENTRIES.getID(0));
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
      CONTROLS.previous(LOOP_TYPE.all);
    } else if (e.key === 'ArrowRight') {
      CONTROLS.next(LOOP_TYPE.all);
    } else if (e.key === 'k') {
      CONTROLS.playToggle();
    } else if (e.key === 'r') {
      CONTROLS.resetCurrent();
    } else if (e.key === '1') {
      CURRENT_URL.loopType(LOOP_TYPE.one);
      loopTypeElem.value = LOOP_TYPE.one;
    } else if (e.key === '2') {
      CURRENT_URL.loopType(LOOP_TYPE.all);
      loopTypeElem.value = LOOP_TYPE.all;
    } else if (e.key === '3') {
      CURRENT_URL.loopType(LOOP_TYPE.once);
      loopTypeElem.value = LOOP_TYPE.once;
    } else if (e.key === '4') {
      CURRENT_URL.loopType(LOOP_TYPE.dont);
      loopTypeElem.value = LOOP_TYPE.dont;
    }
  });
}

function setPageTitle(title, partial) {
  if (title == null) { title = ''; }
  if (partial) {
    title = '"' + title + '" on ' + BASE_PAGE_TITLE;
  }

  document.title = title;
}

function initTemplate(template) {
  return template.content.firstElementChild.cloneNode(true);
}

window.addEventListener('load', init);

function onYouTubeIframeAPIReady() {
  YOUTUBE.init();
}