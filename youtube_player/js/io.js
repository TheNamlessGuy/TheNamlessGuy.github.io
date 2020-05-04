// import { currentURL, currentIndex, saveTitles } from './general';
// import { getLoopType, getVideoID } from './helpers';
// import { SAVE_SEPARATOR, TITLE_BASE_NAME } from './constants';

function save() {
  currentURL.searchParams.set('loop', getLoopType());

  let videoSaveString = '';
  let titleSaveString = '';
  let videos = document.getElementsByClassName('video-container');
  for (let i = 0; i < videos.length; ++i) {
    videoSaveString += getVideoID(videos[i].getElementsByClassName('video')[0].id) + SAVE_SEPARATOR;
    titleSaveString += videos[i].getElementsByClassName('video-title')[0].value + SAVE_SEPARATOR;
  }
  videoSaveString = videoSaveString.substring(0, videoSaveString.length - SAVE_SEPARATOR.length);
  titleSaveString = titleSaveString.substring(0, titleSaveString.length - SAVE_SEPARATOR.length);

  if (videoSaveString === '') {
    currentURL.searchParams.delete('v');
  } else {
    currentURL.searchParams.set('v', videoSaveString);
  }

  if (document.getElementById('shuffle').checked) {
    currentURL.searchParams.set('s', '');
  } else {
    currentURL.searchParams.delete('s');
  }

  if (!document.getElementById('save-titles').checked) {
    currentURL.searchParams.delete('t');
    currentURL.searchParams.set('dnst', '');
  } else if (titleSaveString === '') {
    currentURL.searchParams.delete('t');
    currentURL.searchParams.delete('dnst');
  } else {
    currentURL.searchParams.set('t', titleSaveString);
    currentURL.searchParams.delete('dnst');
  }

  currentURL.searchParams.set('load', currentIndex);

  window.history.replaceState(null, null, currentURL.href);
}

function load_video(videoID, title, id) {
  if (title === '' || title == null) {
    title = TITLE_BASE_NAME;
  }

  document.getElementById(id).value = videoID;
  setVideoTitle(id, title);
}

function load() {
  if (currentURL.searchParams.get('dnst') != null) {
    document.getElementById('save-titles').checked = false;
  }

  document.getElementById('shuffle').checked = (currentURL.searchParams.get('s') != null);

  let videos = currentURL.searchParams.get('v');
  if (videos == null) { return; }
  let titles = currentURL.searchParams.get('t');
  if (titles == null) { titles = ''; }

  videos = videos.split(SAVE_SEPARATOR);
  if (videos.length === 0) { return; }
  titles = titles.split(SAVE_SEPARATOR);

  load_video(videos[0], titles[0], '0');
  for (let i = 1; i < videos.length; i++) {
    plus((i - 1).toString());
    load_video(videos[i], titles[i], i.toString());
  }
}

function addVideo(videoID, title) {
  let videos = document.getElementsByClassName('video-container');

  if (videos.length === 1 && videos[0].getElementsByClassName('video')[0].value === '') {
    load_video(videoID, title, '0');
  } else {
    let id = videos.length;
    plus((id - 1).toString());
    load_video(videoID, title, id.toString());
  }
}

function loadJSBookmark(videos, loop, index, shuffle, saveTitles) {
  let videoContainers = document.getElementsByClassName('video-container');
  while (videoContainers.length > 1) {
    videoContainers[1].parentNode.removeChild(videoContainers[1]);
  }
  videoContainers[0].getElementsByClassName('video')[0].value = '';
  videoContainers[0].getElementsByClassName('video-title')[0].value = '';

  document.getElementById('loopType').value = loop;
  currentIndex = (index >= videos.length) ? videos.length - 1 : index;
  document.getElementById('shuffle').checked = shuffle;
  document.getElementById('save-titles').checked = saveTitles;

  for (let video of videos) {
    addVideo(video[0], video[1]);
  }

  save();
  playVideo(currentIndex);
}

function generateJSBookmark() {
  let link = 'javascript:if(window.location.href.startsWith("https://thenamlessguy.github.io/youtube_player/")){loadJSBookmark('
  // let link = 'javascript:loadJSBookmark('; // For testing

  // Videos
  link += '[';
  let videos = document.getElementsByClassName('video-container');
  for (let i = 0; i < videos.length; ++i) {
    if (i > 0) { link += ','; }

    let videoID = videos[i].getElementsByClassName('video')[0].value;
    let title = videos[i].getElementsByClassName('video-title')[0].value;
    link += '["' + videoID + '","' + title + '"]'
  }
  link += '],';

  // Values
  link += '"' + getLoopType() + '",';
  link += currentIndex + ',';
  link += document.getElementById('shuffle').checked + ',';
  link += document.getElementById('save-titles').checked;

  link += ');}';
  // link += ');'; // For testing
  let display = document.getElementById('save-link-location');
  display.href = link;
  display.classList.remove('hidden');
}