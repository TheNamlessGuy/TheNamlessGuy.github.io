// import { currentURL } from './general';
// import { getLoopType, getVideoID } from './helpers';
// import { SAVE_SEPARATOR, SAVE_DATA_SEPARATOR, TITLE_BASE_NAME } from './constants';

function save() {
  currentURL.searchParams.set('loop', getLoopType());

  let videoSaveString = '';
  let videos = document.getElementsByClassName('video-container');
  for (let i = 0; i < videos.length; ++i) {
    let tmp = getVideoID(videos[i].getElementsByClassName('video')[0].id);

    let title = videos[i].getElementsByClassName('video-title')[0].innerHTML;
    if (title !== TITLE_BASE_NAME) { tmp += SAVE_DATA_SEPARATOR + title; }

    videoSaveString += tmp + SAVE_SEPARATOR;
  }
  videoSaveString = videoSaveString.substring(0, videoSaveString.length - SAVE_SEPARATOR.length);

  if (videoSaveString === '') {
    currentURL.searchParams.delete('v');
  } else {
    currentURL.searchParams.set('v', videoSaveString);
  }

  window.history.replaceState(null, null, currentURL.href);
}

function load_video(saved, id) {
  let videoID = saved;

  if (videoID.indexOf(SAVE_DATA_SEPARATOR) !== -1) {
    let split = videoID.split(SAVE_DATA_SEPARATOR);
    videoID = split[0];
    document.getElementById('title' + id).innerHTML = split[1];
  }

  document.getElementById(id).value = videoID;
}

function load() {
  let videos = currentURL.searchParams.get('v');
  if (videos == null) { return; }

  videos = videos.split(SAVE_SEPARATOR);
  if (videos.length === 0) { return; }

  load_video(videos[0], '0');
  for (let i = 1; i < videos.length; i++) {
    plus((i - 1).toString());
    load_video(videos[i], i.toString());
  }
}