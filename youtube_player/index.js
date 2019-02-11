var player;
var currentIndex = 0;
var DEFAULT_VIDEO = 'dQw4w9WgXcQ';
var SAVE_SEPARATOR = ':';
var CURRENT_URL = null;
var TITLES = {'': '[TITLE]'};
var BASE_PAGE_TITLE = "YouTube player - Namless Things";

function playVideo(newIndex) {
  setMinusDisable(false, currentIndex);
  currentIndex = newIndex;
  setMinusDisable(true, currentIndex);

  setIndexDisplay();

  var videoID = getVideoID(document.getElementsByClassName('video')[currentIndex].id);
  if (videoID === '') {
    videoID = DEFAULT_VIDEO;
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
    setTitleOfVideoID(getVideoID(e.target.id), TITLES['']);
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
  title.innerHTML = TITLES[''];
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

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    next(document.getElementById('loopType').options[loopType.selectedIndex].value);
  }
  if (event.data === YT.PlayerState.PLAYING) {
    setTitleOfVideoID(player.getVideoData().video_id, player.getVideoData().title);
    setPageTitle(TITLES[player.getVideoData().video_id]);
  }
}

function setTitleOfVideoID(id, title) {
  if (!(id in TITLES)) {
    TITLES[id] = title;
  }

  var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    if (getVideoID(videos[i].id) !== id) {
      continue;
    }

    var titleElem = videos[i].parentElement.getElementsByClassName('video-title')[0];
    titleElem.innerHTML = TITLES[id];
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

function getSaveString() {
  var retval = "";
  var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    retval += getVideoID(videos[i].id) + SAVE_SEPARATOR;
  }
  return retval.slice(0, -SAVE_SEPARATOR.length);
}

function save() {
  var saveString = getSaveString();
  if (saveString == '') {
    CURRENT_URL.searchParams.delete('v');
  } else {
    CURRENT_URL.searchParams.set('v', saveString);
  }
  window.history.replaceState(null, null, CURRENT_URL.href);
}

function minimalize() {
  var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    videos[i].value = getVideoID(videos[i].id);
  }
}

function clear() {
  if (player != null) {
    player.stopVideo();
  }

  var videos = document.getElementsByClassName('videoContainer');
  for (var i = videos.length - 1; i > 0; i--) {
    videos[i].parentElement.removeChild(videos[i]);
  }

  videos[0].getElementsByClassName('video')[0].value = '';
  videos[0].getElementsByClassName('video-title')[0].innerHTML = TITLES[''];

  setIndexDisplay();
}

window.onload = function() {
  setPageTitle(null);

  fillVideoContainer(document.getElementsByClassName('videoContainer')[0], 0);
  document.getElementById('minus0').style.visibility = 'hidden';

  document.getElementById('next').onclick = () => {
    next("all");
  }

  document.getElementById('prev').onclick = () => {
    prev("all");
  }

  document.getElementById('minimalize').onclick = () => {
    minimalize();
  }

  document.getElementById('clear').onclick = () => {
    clear();
  }

  CURRENT_URL = new URL(window.location.href);
  load();

  var autoplayIndex = CURRENT_URL.searchParams.get('autoplay');
  if (autoplayIndex != null) {
    playIndex(autoplayIndex);
  }
}

function displayError(msg) {
  document.getElementById('error').innerHTML = msg;
}

window.onerror = function() {
  displayError("Something went wrong, please check the dev console");
}