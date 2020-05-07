// import { player, playVideo, currentIndex, next, setTitleOfVideoID, setPageTitle } from './general'
// import { getLoopType, setVideoIDUnavailable } from './helpers';

function startYouTube() {
  let tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  let firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onPlayerReady() {
  playVideo(currentIndex);
}

function onPlayerError(event) {
  if (event.data === 101 || event.data === 150) { // Same thing
    // Video is unavailable
    setVideoIDUnavailable(player.getVideoData().video_id, true);
    next(getLoopType());
  }
}

function onPlayerStateChange(event) {
  if (event.data === -1 && player.getVideoData().title !== '') {
    setTitleOfVideoID(player.getVideoData().video_id, player.getVideoData().title);
  }

  if (event.data === YT.PlayerState.ENDED) {
    next(getLoopType());
  } else if (event.data === YT.PlayerState.PLAYING) {
    setVideoIDUnavailable(player.getVideoData().video_id, false);
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
      'onError': onPlayerError,
    }
  });
}