// import { currentURL } from './general';
// import { getLoopType, getVideoID } from './helpers';
// import { SAVE_SEPARATOR, TITLE_BASE_NAME } from './constants';

function save() {
  currentURL.searchParams.set('loop', getLoopType());

  let videoSaveString = '';
  let titleSaveString = '';
  let videos = document.getElementsByClassName('video-container');
  for (let i = 0; i < videos.length; ++i) {
    videoSaveString += getVideoID(videos[i].getElementsByClassName('video')[0].id) + SAVE_SEPARATOR;
    titleSaveString += videos[i].getElementsByClassName('video-title')[0].innerHTML + SAVE_SEPARATOR;
  }
  videoSaveString = videoSaveString.substring(0, videoSaveString.length - SAVE_SEPARATOR.length);
  titleSaveString = titleSaveString.substring(0, titleSaveString.length - SAVE_SEPARATOR.length);

  if (videoSaveString === '') {
    currentURL.searchParams.delete('v');
  } else {
    currentURL.searchParams.set('v', videoSaveString);
  }

  if (titleSaveString === '') {
    currentURL.searchParams.delete('t');
  } else {
    currentURL.searchParams.set('t', titleSaveString);
  }

  window.history.replaceState(null, null, currentURL.href);
}

function load_video(videoID, title, id) {
  if (title === '' || title == null) {
    title = TITLE_BASE_NAME;
  }

  document.getElementById(id).value = videoID;
  document.getElementById('title' + id).innerHTML = title;
}

function load() {
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