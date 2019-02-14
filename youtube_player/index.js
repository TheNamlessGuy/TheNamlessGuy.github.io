var player;
var currentIndex = 0;
var SAVE_SEPARATOR = ':';
var CURRENT_URL = null;
var TITLE_BASE_NAME = '';
var TITLE_UNAVAILABLE = '[VIDEO UNAVAILABLE]';
var BASE_PAGE_TITLE = 'YouTube player - Namless Things';
var LAST_PLAYER_STATE = -2;

var DEFAULT_VIDEOS = [
  'dQw4w9WgXcQ', // Never Gonna Give You Up
  '90qT9ZNy2bo', // Wii Shop Channel Music and there is absolutely nothing wrong with it whatsoever
  'lXMskKTw3Bc', // Never Gonna Hit Those Notes
  'ykwqXuMPsoc', // Narwhals
  'NN75im_us4k', // Never Gonna Give Your Teen Spirit Up
  '4WgT9gy4zQA', // Ultimate showdown
  'k85mRPqvMbE', // Crazy Frog - Axel F
  'astISOttCQ0', // The Gummy Bear Song
  'N_x72hA7_SY', // Dragonstea Din Tei (Numa Numa)
  'J_DV9b0x7v4', // Caramelldansen
  'J---aiyznGQ', // Keyboard Cat (RIP)
  'wGlBwW7f5HA', // ( ͡° ͜ʖ ͡°)
  '1wnE4vF9CQ4', // Ieva's Polka (Leek Spin)
  'p3G5IXn0K7A', // Hamsterdance
  'QH2-TGUlwu4', // Nyan Cat
  'q6EoRBvdVPQ', // YEEEEEEE
  'Y4QGPWLY-EM', // YO LISTEN UP HERE'S A STORY
  'EwTZ2xpQwpA', // Chocolate Rain
  'iEXPkv7lJgc', // We Are Number One (RIP)
  'Z3ZAGBL6UBA', // It's peanut butter jelly time (sorry)
  'uE-1RPDqJAY', // My childhood (They're taking the hobbits to Isengard)
  'qmjOd9Dlr34', // Trololololololololo
  'aKULi72yUko', // Manamanah
  'eDU0CTDMk2g', // Do You Like Waffles?
  'kFF3pVOHtoA', // Schfifty Five
  'ENnAa7rqtBM', // Everyone else has had more sex than me (unrelated but it's also the song title)
  'QTqD7I3Dksw', // Up butt coconut
  'KMYN4djSq7o', // The Llama Song
  'UcwfEMdV-aM', // MY ANUS IS BLEEDING
  'c71RCAyLS1M', // Living in the Sunlight
  'HEXWRTEbj1I', // Vladislav
  '5xxQs34UMx4', // The Shrek Song
  'y6120QOlsfU', // That one song no one can ever remember the name of
  'y983TDjoglQ', // HOW COULD THIS HAPPEN TO MEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
  'ZZ5LpwO-An4', // The He-man song
  'TKfS5zVfGBc', // free cheat codez for gta:sa realy easy!!
  'thhaf-bKWyg', // The inferior version of HOW COULD THIS HAPPEN TO MEEEEEEEEEEEEEEEEEEEEEEEEEEE
  'Ijhhe8Q_dQs', // The most inspiring song ever
  'ahdH8eTydWY', // Ladies and gentlemen, we got 'em
  'UcLph-scF-0', // Blue eyes white skeleton song
  'E9s1ltPGQOo', // It's just the Mii Channel music
  'ygI-2F8ApUM', // Superior LOTR (Brodyquest)
  'AO6ePzKVeuE', // Hey wanna go shopping with Mr Skeltal?
  '0L_kQ_wbsAM', // A singular doot
  'Oa-ae6_okmg', // For when you are surrounded by faces that are familiar
  '4zLfCnGVeL4', // Hola oscuridad, mi viejo amigo
  'rvrZJ5C_Nwg', // Old man yells at mountain
  'j6KnvkEPAZg', // Big Iron
  'feA64wXhbjo', // Gunfire at the Oscars
  '-1dSY6ZuXEY', // Spooky Scary Skeletons
  '4aneAWxzOUk', // Don't Stop Me (from hitting those notes) Now
  '5FjWe31S_0g', // Fuck this shit I'm out
  'djV11Xbc914', // Take On Me (it's a meme if you count the WHEN YOU X WITH YOUR MATES videos)
  '1vrEljMfXYo', // Take Me Home, Country Roads
  'umAL-6-j1Ew', // That one really annoying one
  'aQkPcPqTq4M', // 𝒶 𝑒 𝓈 𝓉 𝒽 𝑒 𝓉 𝒾 𝒸
  'U06jlgpMtQs', // For when you bleed red
  'aiSdTQ9DW9g', // Rasputin
  'dP9Wp6QVbsk', // Die Woodys
  'izGwDsrQ1eQ', // Winking emoji
  'PGNiXGX2nLU', // The Beyblade song
  'Hy8kmNEo1i8', // The poop fetishist
  '6W5pq4bIzIw', // Boombastic
  '6E5m_XtCX3c', // Ocean Man
  'vTIIMJ9tUc8', // Tunak Tunak Tun
  'SDklocLs8mU', // Early 2000s emo kid anthem
  'K5tVbVu9Mkg', // Cook by the book, bitch
  'fbGkxcY7YFU', // What What (in the Butt)
  'gy1B3agGNxw', // Epic Sax Guy
  'kfVsfOSbJY0', // That one between Thursday and Saturday
  '9bZkp7q19f0', // Gangnam style
  'AZFuvVdIgSw', // Rappin' For Jesus
  'jofNR_WkoCE', // They bark jesus christ they're basically dogs what did you expect
];
var DEFAULT_VIDEOS_INDEX = -1;

function getDefaultVideo() {
  if (CURRENT_URL.searchParams.get('DEFAULT_NO_RANDOM') == null) {
    return DEFAULT_VIDEOS[Math.floor(Math.random() * DEFAULT_VIDEOS.length)];
  }

  DEFAULT_VIDEOS_INDEX = (DEFAULT_VIDEOS_INDEX + 1) % DEFAULT_VIDEOS.length;
  return DEFAULT_VIDEOS[DEFAULT_VIDEOS_INDEX];
}

function playVideo(newIndex) {
  setMinusDisable(false, currentIndex);
  currentIndex = newIndex;
  setMinusDisable(true, currentIndex);

  setIndexDisplay();

  var videoID = getVideoID(document.getElementsByClassName('video')[currentIndex].id);
  if (videoID === '') {
    videoID = getDefaultVideo();
  }
  player.loadVideoById(videoID, 0, 'large');
}

function setMinusDisable(value, index) {
  var buttons = document.getElementsByClassName('videoContainer')[index].getElementsByTagName('button');
  if (buttons.length == 3) {
    buttons[2].disabled = value;
  }
}

function setIndexDisplay() {
  document.getElementById('currentIndex').innerHTML = '(' + (parseInt(currentIndex) + 1) + ' / ' + document.getElementsByClassName('video').length + ')';
}

function startYouTube() {
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function getVideoID(id) {
  var video = document.getElementById(id).value;
  if (video.startsWith('https://')) {
    if (video.includes('youtu.be/')) {
      video = video.substring(video.indexOf('youtu.be/') + 9, video.length);
      if (video.includes('?')) {
        video = video.substring(0, video.indexOf('?'));
      }
    } else if (video.includes('youtube')) {
      video = video.substring(video.indexOf('v=') + 2, video.length);
      if (video.includes('&')) {
        video = video.substring(0, video.indexOf('&'));
      }
    }
  }
  return video;
}

function findIndexOfID(id) {
  var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    if (videos[i].id == id) {
      return i;
    }
  }
  return -1;
}

function playIndex(index) {
  if (document.getElementById('player').tagName === 'DIV') {
    // Hasn't been initiated
    currentIndex = index;
    startYouTube();
  } else {
    playVideo(index);
  }
}

function play(id) {
  playIndex(findIndexOfID(id));
}

function plus(id) {
  var newID = document.getElementsByClassName('video').length;
  var tag = document.createElement('div');
  tag.id = 'video' + newID;
  tag.classList.add('videoContainer');

  var plussed = document.getElementById('video' + id);
  plussed.parentNode.insertBefore(tag, plussed.nextSibling);

  fillVideoContainer(tag, newID);
  setIndexDisplay();
}

function minus(id) {
  var index = findIndexOfID(id);
  var videoContainer = document.getElementById('video' + id);
  videoContainer.parentNode.removeChild(videoContainer);
  if (index < currentIndex) {
    currentIndex--;
  }
  setIndexDisplay();
}

function fillVideoContainer(tag, newID) {
  var play = document.createElement('button');
  play.type = 'button';
  play.innerHTML = 'Play';
  play.id = 'play' + newID;
  tag.appendChild(play);

  var input = document.createElement('input');
  input.id = newID;
  input.classList.add('video');
  input.type = 'text';
  input.addEventListener('change', function (e) {
    save();
    setTitleOfVideoID(getVideoID(e.target.id), TITLE_BASE_NAME);
  });
  tag.appendChild(input);

  var plus = document.createElement('button');
  plus.type = 'button';
  plus.innerHTML = '+';
  plus.id = 'plus' + newID;
  tag.appendChild(plus);

  var minus = document.createElement('button');
  minus.type = 'button';
  minus.innerHTML = '-';
  minus.id = 'minus' + newID;
  tag.appendChild(minus);

  var title = document.createElement('div');
  title.id = 'title' + newID;
  title.innerHTML = TITLE_BASE_NAME;
  title.classList.add('slightly-hidden');
  title.classList.add('video-title');
  tag.appendChild(title);

  initVideoElement(newID);
}

function initVideoElement(id) {
  document.getElementById('play' + id).onclick = () => {
    play(id);
  }
  document.getElementById('plus' + id).onclick = () => {
    plus(id);
  }
  document.getElementById('minus' + id).onclick = () => {
    minus(id);
  }
}

function onStart() {
  startYouTube();
  var startingButton = document.getElementById('startingButton');
  startingButton.parentNode.removeChild(startingButton);
}

function onPlayerReady(event) {
  playVideo(currentIndex);
}

function prev(selection) {
  var newIndex = -1;
  var total = document.getElementsByClassName('video').length;

  if (selection === 'all') {
    newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = total - 1;
    }
  } else if (selection === 'one') {
    newIndex = currentIndex;
  } else if (selection === 'none') {
    newIndex = currentIndex - 1;
  }

  if (newIndex >= 0 && newIndex < total) {
    playIndex(newIndex);
  }
}

function next(selection) {
  var newIndex = -1;
  var total = document.getElementsByClassName('video').length;

  if (selection === 'all') {
    newIndex = (currentIndex + 1) % total;
  } else if (selection === 'one') {
    newIndex = currentIndex;
  } else if (selection === 'none') {
    newIndex = currentIndex + 1;
  }

  if (newIndex < total) {
    playIndex(newIndex);
  }
}

function getLoopType() {
  return document.getElementById('loopType').options[loopType.selectedIndex].value;
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    next(getLoopType());
  } else if (event.data === YT.PlayerState.UNSTARTED && LAST_PLAYER_STATE === YT.PlayerState.BUFFERING) {
    // 'Video unavailable'
    setTitleOfVideoID(player.getVideoData().video_id, TITLE_UNAVAILABLE);
    next(getLoopType());
  }
  if (event.data === YT.PlayerState.PLAYING) {
    setTitleOfVideoID(player.getVideoData().video_id, player.getVideoData().title);
    setPageTitle(player.getVideoData().title);
  }

  LAST_PLAYER_STATE = event.data;
}

function setTitleOfVideoID(id, title) {
  var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    if (getVideoID(videos[i].id) !== id) {
      continue;
    }

    var titleElem = videos[i].parentElement.getElementsByClassName('video-title')[0];
    titleElem.innerHTML = title;
  }
}

function setPageTitle(title) {
  if (title != null) {
    document.title = '"' + title + '" - ' + BASE_PAGE_TITLE;
  } else {
    document.title = BASE_PAGE_TITLE;
  }
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function load() {
  var videos = CURRENT_URL.searchParams.get('v');
  if (videos == null) {
    return;
  }

  var videos = videos.split(SAVE_SEPARATOR);
  if (videos.length === 0) {
    return;
  }

  var videoContainers = document.getElementsByClassName('videoContainer');
  while (videoContainers.length > 1) {
    var vc = videoContainers[0];
    if (vc.id === 'video0') {
      vc = videoContainers[1];
    }
    vc.parentNode.removeChild(vc);
  }

  document.getElementById('0').value = videos[0];
  for (var i = 1; i < videos.length; i++) {
    plus((i - 1).toString());
    document.getElementById(i.toString()).value = videos[i];
  }
}

function getVideoSaveString() {
  var retval = '';
  var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    retval += getVideoID(videos[i].id) + SAVE_SEPARATOR;
  }
  return retval.slice(0, -SAVE_SEPARATOR.length);
}

function save() {
  var videoSaveString = getVideoSaveString();
  if (videoSaveString == '') {
    CURRENT_URL.searchParams.delete('v');
  } else {
    CURRENT_URL.searchParams.set('v', videoSaveString);
  }

  CURRENT_URL.searchParams.set('loop', getLoopType());

  window.history.replaceState(null, null, CURRENT_URL.href);
}

function minimalize() {
  var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    videos[i].value = getVideoID(videos[i].id);
  }
}

function reset() {
  if (player != null) {
    player.stopVideo();
  }

  var videos = document.getElementsByClassName('videoContainer');
  for (var i = videos.length - 1; i > 0; i--) {
    videos[i].parentElement.removeChild(videos[i]);
  }

  videos[0].getElementsByClassName('video')[0].value = '';
  videos[0].getElementsByClassName('video-title')[0].innerHTML = TITLE_BASE_NAME;
  setPageTitle(null);
  displayError('');

  document.getElementById('loopType').value = 'all';
  currentIndex = 0;
  DEFAULT_VIDEOS_INDEX = -1;
  setIndexDisplay();

  save();
}

window.onload = function() {
  setPageTitle(null);

  fillVideoContainer(document.getElementsByClassName('videoContainer')[0], 0);
  document.getElementById('minus0').style.visibility = 'hidden';

  document.getElementById('next').onclick = () => {
    next('all');
  }

  document.getElementById('prev').onclick = () => {
    prev('all');
  }

  document.getElementById('minimalize').onclick = () => {
    minimalize();
  }

  document.getElementById('reset').onclick = () => {
    reset();
  }

  document.getElementById('loopType').onchange = () => {
    save();
  }

  CURRENT_URL = new URL(window.location.href);
  load();

  var loop = CURRENT_URL.searchParams.get('loop');
  if (loop != null && ['all', 'one', 'none'].includes(loop)) {
    document.getElementById('loopType').value = loop;
  } else {
    save();
  }

  var autoplayIndex = CURRENT_URL.searchParams.get('autoplay');
  if (autoplayIndex != null) {
    playIndex(autoplayIndex);
  }
}

function displayError(msg) {
  document.getElementById('error').innerHTML = msg;
}

window.onerror = function() {
  displayError('Something went wrong, please check the dev console');
}