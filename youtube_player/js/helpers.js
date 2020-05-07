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

function setVideoTitle(id, title) {
  setVideoElemTitle(document.getElementById('title' + id), title);
}

function setVideoElemTitle(elem, title) {
  elem.value = title;
  elem.style.width = Math.max(24, title.length) + 'ch';
}

function randomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setVideoIDUnavailable(id, add) {
  let videos = document.getElementsByClassName('video');
  for (let i = 0; i < videos.length; i++) {
    if (getVideoID(videos[i].id) !== id) { continue; }

    let titleElem = videos[i].parentElement.getElementsByClassName('video-title')[0];
    if (add) {
      titleElem.classList.add('video-unavailable');
    } else {
      titleElem.classList.remove('video-unavailable');
    }
  }
}