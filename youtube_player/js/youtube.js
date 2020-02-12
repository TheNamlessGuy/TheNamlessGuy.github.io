// import { player, playVideo, currentIndex, next, setTitleOfVideoID, setPageTitle } from './general'
// import { getLoopType } from './helpers';

function startYouTube() {
  let tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  let firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onPlayerReady() {
  playVideo(currentIndex);
}

function onError(event) {
  if (event.data === 101 || event.data === 150) { // Same thing
    // Video is unavailable
    setTitleOfVideoID(player.getVideoData().video_id, TITLE_UNAVAILABLE);
    next(getLoopType());
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    next(getLoopType());
  } else if (event.data === YT.PlayerState.PLAYING) {
    setTitleOfVideoID(player.getVideoData().video_id, player.getVideoData().title);
    setPageTitle(null);
    save();
  }
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onError,
    }
  });
}