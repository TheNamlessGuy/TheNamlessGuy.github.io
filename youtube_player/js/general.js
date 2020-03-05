// import { SAVE_SEPARATOR, TITLE_BASE_NAME, TITLE_UNAVAILABLE, BASE_PAGE_TITLE } from './constants';
// import { save, load } from './io';
// import { getVideoID, minimize, reset, findIndexOfID, setActiveVideo, getDefaultVideo, setIndexDisplay } from './helpers';
// import { startYouTube } from './youtube';

let player = null;
let currentURL = null;
let currentIndex = 0;

function setPageTitle(title) {
  if (title == null) {
    title = '"' + document.getElementById('title' + currentIndex).innerHTML + '" on ' + BASE_PAGE_TITLE;
  }

  document.title = title;
}

function playVideo(index) {
  setActiveVideo(currentIndex, false);
  currentIndex = parseInt(index, 10);
  setActiveVideo(currentIndex, true);

  setIndexDisplay();

  let videoID = getVideoID(document.getElementsByClassName('video')[currentIndex].id);
  if (videoID === '') { videoID = getDefaultVideo(); }
  player.loadVideoById(videoID, 0, 'large');
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

function setTitleOfVideoID(videoID, title) {
  let videos = document.getElementsByClassName('video');
  for (let i = 0; i < videos.length; i++) {
    if (getVideoID(videos[i].id) !== videoID) { continue; }

    let titleElem = videos[i].parentElement.getElementsByClassName('video-title')[0];
    if (titleElem.innerHTML === TITLE_BASE_NAME || titleElem.innerHTML === TITLE_UNAVAILABLE) {
      titleElem.innerHTML = title;
      save();
    }
  }
}

function plus(id) {
  let index = findIndexOfID(id);
  let newID = document.getElementsByClassName('video').length;
  let container = document.createElement('div');
  container.id = 'video' + newID;
  container.classList.add('video-container');

  let plussed = document.getElementById('video' + id);
  plussed.parentNode.insertBefore(container, plussed.nextSibling);

  fillVideoContainer(container, newID);
  if (index < currentIndex) { currentIndex++; }
  setIndexDisplay();
}

function minus(id) {
  let index = findIndexOfID(id);
  let videoContainer = document.getElementById('video' + id);
  videoContainer.parentNode.removeChild(videoContainer);
  if (index < currentIndex) { currentIndex--; }
  setIndexDisplay();
}

function fillVideoContainer(container, newID) {
  let index = document.createElement('div');
  index.id = 'index' + newID;
  index.innerHTML = '';
  index.classList.add('video-index');
  index.classList.add('slightly-hidden');

  let play = document.createElement('button');
  play.type = 'button';
  play.innerHTML = 'Play';
  play.id = 'play' + newID;
  play.addEventListener('click', () => { playIndex(findIndexOfID(newID)); });

  let title = document.createElement('div');
  title.id = 'title' + newID;
  title.innerHTML = TITLE_BASE_NAME;
  title.classList.add('slightly-hidden');
  title.classList.add('video-title');

  let video = document.createElement('input');
  video.id = newID;
  video.classList.add('video');
  video.type = 'text';
  video.addEventListener('change', () => {
    save();
    title.innerHTML = TITLE_BASE_NAME;
  })

  let plusElem = document.createElement('button');
  plusElem.type = 'button';
  plusElem.innerHTML = '+';
  plusElem.id = 'plus' + newID;
  plusElem.addEventListener('click', () => { plus(newID) });

  let minusElem = document.createElement('button');
  minusElem.type = 'button';
  minusElem.innerHTML = '-';
  minusElem.id = 'minus' + newID;
  minusElem.addEventListener('click', () => { minus(newID) });

  container.appendChild(play);
  container.appendChild(video);
  container.appendChild(plusElem);
  container.appendChild(minusElem);
  container.appendChild(index);
  container.appendChild(title);
}

function next(loopType) {
  let newIndex = -1;
  let total = document.getElementsByClassName('video').length;

  if (loopType === 'all') {
    newIndex = (currentIndex + 1) % total;
  } else if (loopType === 'one') {
    newIndex = currentIndex;
  } else if (loopType === 'none') {
    newIndex = currentIndex + 1;
  }

  if (newIndex < total) {
    playIndex(newIndex);
  }
}

function prev(loopType) {
  let newIndex = -1;
  let total = document.getElementsByClassName('video').length;

  if (loopType === 'all') {
    newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = total - 1;
    }
  } else if (loopType === 'one') {
    newIndex = currentIndex;
  } else if (loopType === 'none') {
    newIndex = currentIndex - 1;
  }

  if (newIndex >= 0 && newIndex < total) {
    playIndex(newIndex);
  }
}

window.addEventListener('load', () => {
  setPageTitle(BASE_PAGE_TITLE);

  let container = document.createElement('div');
  container.id = 'video0';
  container.classList.add('video-container');
  document.getElementById('videos').appendChild(container);
  fillVideoContainer(container, 0);
  document.getElementById('minus0').style.visibility = 'hidden';
  setIndexDisplay();

  document.getElementById('next').addEventListener('click', () => { next('all'); });
  document.getElementById('prev').addEventListener('click', () => { prev('all'); });
  document.getElementById('minimize').addEventListener('click', () => { minimize(); });
  document.getElementById('reset').addEventListener('click', () => { reset(); });
  document.getElementById('loopType').addEventListener('change', () => { save(); });
  document.getElementById('save-titles').addEventListener('change', () => { save(); });

  currentURL = new URL(window.location.href);
  load();

  let loop = currentURL.searchParams.get('loop');
  if (loop != null && ['all', 'one', 'none'].includes(loop)) {
    document.getElementById('loopType').value = loop;
  } else {
    save();
  }

  let loadIndex = currentURL.searchParams.get('load');
  if (loadIndex != null) {
    playIndex(loadIndex);
  }
});

function displayError(error) { document.getElementById('error').innerHTML = error; }
window.addEventListener('error', () => { displayError('Something went wrong, please check the dev console'); });
