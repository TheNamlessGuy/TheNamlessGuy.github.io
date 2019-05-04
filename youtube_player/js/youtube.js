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

let lastPlayerState = null;
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    next(getLoopType());
  } else if (event.data === YT.PlayerState.UNSTARTED && lastPlayerState === YT.PlayerState.BUFFERING) {
    // 'Video unavailable'
    setTitleOfVideoID(player.getVideoData().video_id, TITLE_UNAVAILABLE);
    next(getLoopType());
  }
  if (event.data === YT.PlayerState.PLAYING) {
    setTitleOfVideoID(player.getVideoData().video_id, player.getVideoData().title);
    setPageTitle(player.getVideoData().title);
  }

  lastPlayerState = event.data;
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