// import { currentURL } from './general';
// import { getLoopType, getVideoID } from './helpers';
// import { SAVE_SEPARATOR } from './constants';

function save() {
  currentURL.searchParams.set('loop', getLoopType());

  let videoSaveString = '';
  let videos = document.getElementsByClassName('video');
  for (let i = 0; i < videos.length; ++i) {
    videoSaveString += getVideoID(videos[i].id) + SAVE_SEPARATOR;
  }
  videoSaveString = videoSaveString.substring(0, videoSaveString.length - SAVE_SEPARATOR.length);

  if (videoSaveString === '') {
    currentURL.searchParams.delete('v');
  } else {
    currentURL.searchParams.set('v', videoSaveString);
  }

  window.history.replaceState(null, null, currentURL.href);
}

function load() {
  let videos = currentURL.searchParams.get('v');
  if (videos == null) { return; }

  videos = videos.split(SAVE_SEPARATOR);
  if (videos.length === 0) { return; }

  document.getElementById('0').value = videos[0];
  for (let i = 1; i < videos.length; i++) {
    plus((i - 1).toString());
    document.getElementById(i.toString()).value = videos[i];
  }
}