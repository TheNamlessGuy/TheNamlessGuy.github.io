// import { player, setIndexDisplay, setPageTitle, displayError, currentURL, currentIndex } from './general';
// import { TITLE_BASE_NAME, DEFAULT_VIDEOS } from './constants';
// import { save } from './io';

function getVideoID(id) {
  let video = document.getElementById(id).value;
  if (!video.startsWith('https://')) { return video; }

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

  return video;
}

function minimalize() {
  let videos = document.getElementsByClassName('video');
  for (let i = 0; i < videos.length; i++) {
    videos[i].value = getVideoID(videos[i].id);
  }
}

function reset() {
  if (player != null) { player.stopVideo(); }

  let videos = document.getElementsByClassName('video-container');
  for (let i = videos.length - 1; i > 0; i--) {
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

function findIndexOfID(id) {
  let videos = document.getElementsByClassName('video');
  for (let i = 0; i < videos.length; i++) {
    if (videos[i].id == id) {
      return i;
    }
  }
  return -1;
}

function setActiveVideo(index, value) {
  let elem = document.getElementsByClassName('video-container')[index];

  // Disable/enable minus button
  let buttons = elem.getElementsByTagName('button');
  if (buttons.length === 3) { buttons[2].disabled = value; }

  let title = elem.getElementsByClassName('video-title')[0];
  if (value) {
    title.classList.add('neon');
  } else {
    title.classList.remove('neon');
  }
}

let defaultVideosIndex = -1;
function getDefaultVideo() {
  if (currentURL.searchParams.get('DEFAULT_NO_RANDOM') == null) {
    return DEFAULT_VIDEOS[Math.floor(Math.random() * DEFAULT_VIDEOS.length)];
  }

  defaultVideosIndex = (defaultVideosIndex + 1) % DEFAULT_VIDEOS.length;
  return DEFAULT_VIDEOS[defaultVideosIndex];
}

function setIndexDisplay() {
  document.getElementById('currentIndex').innerHTML = '(' + (parseInt(currentIndex) + 1) + ' / ' + document.getElementsByClassName('video').length + ')';

  let indexes = document.getElementsByClassName('video-index');
  for (let i = 0; i < indexes.length; ++i) {
    indexes[i].innerHTML = '#' + (i + 1);
  }
}

function getLoopType() {
  return document.getElementById('loopType').options[loopType.selectedIndex].value;
}