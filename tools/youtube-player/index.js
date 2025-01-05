const Tags = {
  SINGALONG: 'singalong',
  NOSTALGIA: 'nostalgia',
  SHOW: 'show',
  VIDYA: 'vidya',
  CHILL: 'chill',
  DANCE: 'dance',
  CLASSIC: 'classic',
  MASHUP: 'mashup',
  HYPE: 'hype',
  HAPPY: 'happy',
  DEPRESSO: 'depresso',
  INDIE_MOVIE_VIBES: 'indie-movie-vibes',
  BASE: 'mmm-spicy-baseline',
  CHRISTMAS: 'christmas',

  GENRE_MUSICAL: 'genre:musical',
  GENRE_INSTRUMENTAL: 'genre:instrumental',
  GENRE_FOLKPUNK: 'genre:folkpunk',
  GENRE_POWERMETAL: 'genre:powermetal',
  GENRE_ACAPELLA: 'genre:acapella',
  GENRE_TANGO: 'genre:tango',
  GENRE_YE_OLDE: 'genre:ye-olde',
};

const Player = {
  _player: null,
  _status: null,

  finished: null,
  _finishedResolve: null,

  initialize: function() {
    Player.finished = new Promise((resolve) => this._finishedResolve = resolve);
  },

  setup: function() {
    if (Player._status != null) { return; }
    Player._status = 'initializing';

    Player._player = new YT.Player('player', {
      height: 390,
      width: 640,
      events: {
        'onReady': Player._onPlayerReady,
        'onStateChange': Player._onPlayerStateChange,
        'onError': Player._onPlayerError,
      },
      playerVars: {
        disablekb: 1,
      }
    });
  },

  play: function() {
    if (Player.video.isLoaded()) {
      Player._player.playVideo();
    } else {
      Playlist.playEntry(Playlist.getCurrentEntry() ?? Playlist.getEntryByIdx(1));
    }
  },
  pause: function() { Player._player.pauseVideo(); },
  stop: function() { Player._player.stopVideo(); },
  togglePlay: function() {
    if (Player.video.isPlaying()) {
      Player.pause();
    } else {
      Player.play();
    }
  },

  loadVideoID: function(videoID) {
    if (!videoID) { return; }
    Player._player.cueVideoById(videoID, 0, 'large');
  },

  playVideoID: function(videoID) {
    if (!videoID) {
      const memes = Playlist.getPredesignedPlaylist('memes');
      videoID = memes[Math.floor(Math.random() * memes.length)].src;
    }

    Player._player.loadVideoById(videoID, 0, 'large');
  },

  _onPlayerReady: function() {
    Player._status = 'initialized';
    Player._finishedResolve();
  },

  _onPlayerStateChange: function(e) {
    const current = Playlist.getCurrentEntry();
    const title = Player.video.title();

    if (e.data === YT.PlayerState.UNSTARTED && title !== '') {
      Playlist.setEntryTitle(current, title);
      Title.set(Playlist.getEntryTitle(current) ?? title);
      Information.setToCurrentEntry();
    } else if (e.data === YT.PlayerState.ENDED) {
      Playlist.playNextEntry();
    } else if (e.data === YT.PlayerState.PLAYING) {
      Playlist.markEntryAsAvailable(current);
      Playlist.setEntryTitle(current, title);
      Title.set(Playlist.getEntryTitle(current) ?? title);
      Information.setToCurrentEntry();
    }
  },

  _onPlayerError: function(e) {
    if (e.data === 101 || e.data === 150) { // Both mean "Video is not available"
      Playlist.markEntryAsUnavailable(Playlist.getCurrentEntry());
      Playlist.playNextEntry();
    }
  },

  video: {
    title: function() { return Player._player.getVideoData().title; },
    isPlaying: function() { return Player._player.getPlayerState() === 1; },
    isPaused: function() { return Player._player.getPlayerState() === 2; },
    isLoaded: function() { return !!Player._player.getVideoData().video_id; },
  },
};

Player.initialize(); // We want to do this before YT even has a chance to load, hence why it's here

const Playlist = {
  _predesignedMap: {},
  addPredesignedPlaylist: function(key, playlist) { this._predesignedMap[key] = playlist; },
  getPredesignedPlaylist: function(key) { return this._predesignedMap[key] ?? null; },
  loadPredesignedPlaylist: function(key) {
    Playlist.loadPlaylist(Playlist.getPredesignedPlaylist(key));
    QueryParameters.set('playlist', key);
  },

  loadPlaylist: function(list) {
    if (!list) { return; }

    const playlist = document.getElementById('playlist');
    while (playlist.hasChildNodes()) { playlist.childNodes[0].remove(); }

    for (const entry of list) {
      Playlist.addEntry({...entry, ...{reindex: false}});
    }

    Playlist._reindex();
  },

  addEntry: function(data = {}) {
    const playlist = document.getElementById('playlist');
    const tr = document.createElement('tr');

    const td = function(containing, classes = []) {
      const td = document.createElement('td');
      td.append(containing);
      td.classList.add(...classes);
      return td;
    };

    const play = document.createElement('button');
    play.innerText = 'Play';
    play.addEventListener('click', () => Playlist.playEntry(tr));
    tr.append(td(play));

    const src = document.createElement('input');
    src.classList.add('src');
    src.placeholder = 'YouTube video ID';
    src.addEventListener('input', () => {
      if (src.value.startsWith('https://youtu.be/')) { // https://youtu.be/dQw4w9WgXcQ
        src.value = new URL(src.value).pathname.substring(1);
      } else if (src.value.includes('youtube.com')) { // https://www.youtube.com/watch?v=dQw4w9WgXcQ
        src.value = new URL(src.value).searchParams.get('v');
      }
    });
    tr.append(td(src));
    if (data.src) { src.value = data.src; }

    const plus = document.createElement('button');
    plus.innerText = '+';
    plus.addEventListener('click', () => Playlist.addEntry({after: tr}));
    tr.append(td(plus));

    const minus = document.createElement('button');
    minus.innerText = '-';
    if (playlist.children.length === 0) {
      minus.classList.add('invisible');
    } else {
      minus.addEventListener('click', () => { tr.remove(); Playlist._reindex(); });
    }
    tr.append(td(minus));

    const idx = document.createElement('span');
    idx.classList.add('index');
    tr.append(td(idx, ['center-text']));

    const title = document.createElement('input');
    title.classList.add('title');
    title.placeholder = 'Title';
    tr.append(td(title));
    title.addEventListener('input', () => Playlist.setEntryTitle(tr, title.value, false));
    if (data.title) { Playlist.setEntryTitle(tr, data.title, false); }

    if (data.after?.nextSibling) {
      playlist.insertBefore(tr, data.after.nextSibling);
    } else {
      playlist.append(tr);
    }

    if (data.reindex ?? true) {
      Playlist._reindex();
    }

    tr.playlistData = data;
  },

  playEntry: function(entry) {
    Playlist.setCurrentEntry(entry);
    Player.playVideoID(entry.getElementsByClassName('src')[0].value);
    QueryParameters.set('idx', entry.id.substring(Playlist._idPrefix.length));
  },

  cueEntry: function(entry) { // This should only be called ONCE, on startup
    Playlist.setCurrentEntry(entry);
    Player.loadVideoID(entry.getElementsByClassName('src')[0].value);
    QueryParameters.set('idx', entry.id.substring(Playlist._idPrefix.length));
  },

  playNextEntry: function(manual = false) {
    const playlist = document.getElementById('playlist');
    const current = playlist.getElementsByClassName('current')[0];
    const loopType = manual ? Controls.loopType.values.ALL : Controls.loopType.get();

    if (loopType === Controls.loopType.values.ONE) {
      Playlist.playEntry(current);
    } else if (loopType === Controls.loopType.values.ALL) {
      Playlist.playEntry(current.nextSibling ?? playlist.getElementsByTagName('tr')[0]);
    } else if (loopType === Controls.loopType.values.ONCE && !!current.nextSibling) {
      Playlist.playEntry(current.nextSibling);
    } // Controls.loopType.values.DONT is a noop, so no need for anything further
  },

  playPreviousEntry: function(manual = false) {
    const playlist = document.getElementById('playlist');
    const current = playlist.getElementsByClassName('current')[0];

    // It really only makes sense for us to only consider Controls.loopType.values.ALL, from a UX perspective
    let previous = current.previousSibling;
    if (!previous) {
      const rows = playlist.getElementsByTagName('tr');
      previous = rows[rows.length - 1];
    }

    Playlist.playEntry(previous);
  },

  setEntryTitle: function(entry, title, ifNotAlreadySet = true) {
    const titleElem = entry.getElementsByClassName('title')[0];
    if (ifNotAlreadySet && titleElem.value) { return; }
    if (!entry.getElementsByClassName('src')[0].value) { return; } // Entries without a src should not have a title

    titleElem.value = title;
    titleElem.style.width = `${Math.clamp(25, title.length, 85)}ch`;
  },

  getEntryTitle: function(entry) {
    const value = entry.getElementsByClassName('title')[0].value;
    return (value === '') ? null : value;
  },

  getEntrySrc: function(entry) {
    const value = entry.getElementsByClassName('src')[0].value;
    return (value === '') ? null : value;
  },

  setCurrentEntry: function(entry) {
    document.getElementById('playlist').getElementsByClassName('current')[0]?.classList.remove('current');
    entry.classList.add('current');
  },

  getCurrentEntry: function() { return document.getElementById('playlist').getElementsByClassName('current')[0]; },
  getEntryByIdx: function(idx) { return document.getElementById('playlist').getElementsByTagName('tr')[idx - 1]; },

  markEntryAsAvailable: function(entry) { entry.classList.remove('unavailable'); },
  markEntryAsUnavailable: function(entry) { entry.classList.add('unavailable'); },

  _idPrefix: 'playlist-entry-',
  _reindex: function() {
    let currentID = QueryParameters.get('idx');
    if (currentID) { currentID = `${Playlist._idPrefix}${currentID}`; }

    const entries = Array.from(document.getElementById('playlist').getElementsByTagName('tr'));
    for (let i = 0; i < entries.length; ++i) {
      if (entries[i].id && currentID === entries[i].id) {
        QueryParameters.set('idx', i + 1);
      }

      entries[i].id = `${Playlist._idPrefix}${i + 1}`;
      entries[i].getElementsByClassName('index')[0].innerText = `#${i + 1}`;
    }
  },
};

const Controls = {
  initialize: function() {
    Hotkeys.register({key: 'ArrowLeft'},  () => Playlist.playPreviousEntry(true));
    Hotkeys.register({key: 'ArrowRight'}, () => Playlist.playNextEntry(true));
    Hotkeys.register({key: 'k'},          () => Player.togglePlay());
    Hotkeys.register({key: 'r'},          () => Player.stop());
    Hotkeys.register({key: 'c'},          () => Controls.scrollToCurrentPlaylistEntry());
    Hotkeys.register({key: '1'},          () => Controls.loopType.set(Controls.loopType.values.ONE));
    Hotkeys.register({key: '2'},          () => Controls.loopType.set(Controls.loopType.values.ALL));
    Hotkeys.register({key: '3'},          () => Controls.loopType.set(Controls.loopType.values.ONCE));
    Hotkeys.register({key: '4'},          () => Controls.loopType.set(Controls.loopType.values.DONT));

    document.getElementById('playlists').addEventListener('change', () => Controls.loadPlaylist(null));
    document.getElementById('loop-type').addEventListener('change', () => QueryParameters.set('loop', document.getElementById('loop-type').value));
  },

  loopType: {
    values: {
      ONE: '1',
      ALL: '2',
      ONCE: '3',
      DONT: '4',
    },

    get: function() { return document.getElementById('loop-type').value; },
    set: function(value) { document.getElementById('loop-type').value = value; },
  },

  scrollToCurrentPlaylistEntry: function() {
    const playlist = document.getElementById('playlist');
    const current = playlist.getElementsByClassName('current')[0];
    if (!current) { return; }

    const offset = playlist.parentElement.getBoundingClientRect().height / 2;
    playlist.parentElement.scrollTo({top: current.offsetTop - offset, behavior: 'auto'});
  },

  loadPlaylist: function(value) {
    const playlists = document.getElementById('playlists');
    if (value == null) { value = playlists.value; }
    Playlist.loadPredesignedPlaylist(value);
    playlists.value = value;
  },
};

const Title = {
  base: 'YouTube player - Namless Things',

  set: function(title) {
    if (title == null) { title = ''; }
    document.title = `"${title}" on ${Title.base}`;
  },
};

const Information = {
  set: function(entry) {
    const data = entry.playlistData;

    Information._setTitle(data, entry);
    Information._setDescription(data);
    Information._setFoundThrough(data);
    Information._setTags(data);
  },

  setToCurrentEntry: function() {
    Information.set(Playlist.getCurrentEntry());
  },

  _setTitle: function(data, entry) {
    const elem = document.getElementById('info-title');
    elem.innerText = data?.title ?? Playlist.getEntryTitle(entry);
    elem.title = `'${elem.innerText}' on YouTube`;
    elem.href = Information._getLinkFromData(data) ?? Information._getLinkFromEntry(entry);
  },

  _setDescription: function(data) {
    const elem = document.getElementById('info-description');
    if (data?.description == null) {
      elem.innerText = '';
      elem.classList.remove('mb15p');
    } else {
      elem.innerText = data.description;
      elem.classList.add('mb15p');
      Information._replaceLinks(elem);
    }
  },

  _setFoundThrough: function(data) {
    const elem = document.getElementById('info-found-through');
    if (data?.found_through == null) {
      elem.innerText = '';
    } else {
      elem.innerText = `Found through: ${data.found_through}`;
      Information._replaceLinks(elem);
    }
  },

  _setTags: function(data) {
    const elem = document.getElementById('info-tags');
    while (elem.firstChild) { elem.removeChild(elem.lastChild); }

    const tags = data?.tags ?? [];
    for (const tag of tags) {
      const span = document.createElement('span');
      span.innerText = tag;
      elem.append(span);
    }
  },

  _replaceLinks: function(elem) {
    Array.from(elem.innerText.matchAll(/(http|https):\/\/[^\s]+/g)).reverse().forEach((value) => {
      elem.innerHTML = elem.innerHTML.substring(0, value.index) + `<a href="${value[0]}">${value[0]}</a>` + elem.innerHTML.substring(value.index + value[0].length);
    });
  },

  _getLinkFromData: function(data) {
    return (data == null) ? null : `https://youtu.be/${data.src}`;
  },

  _getLinkFromEntry: function(entry) {
    return `https://youtu.be/${Playlist.getEntrySrc(entry)}`;
  },
};

function onYouTubeIframeAPIReady() { // https://developers.google.com/youtube/iframe_api_reference#Requirements
  Player.setup();
}

window.addEventListener('load', async () => {
  const content = document.getElementById('content');
  content.style.height = `calc(100% - ${content.getBoundingClientRect().top}px)`;

  await Player.finished;

  if (QueryParameters.has('loop')) {
    Controls.loopType.set(QueryParameters.get('loop'));
  }

  if (QueryParameters.has('playlist')) {
    Controls.loadPlaylist(QueryParameters.get('playlist'));
  } else {
    Playlist.addEntry();
  }

  if (QueryParameters.has('idx')) {
    Playlist.cueEntry(Playlist.getEntryByIdx(QueryParameters.get('idx')));
  }

  Controls.initialize();
});