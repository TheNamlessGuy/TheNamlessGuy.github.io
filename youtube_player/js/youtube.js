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

let previousStates = [];
let firstUnavailableVideoIndex = null;
function onPlayerStateChange(event) {
  console.log('onPlayerStateChange', event, YT.PlayerState);
  // if (loading) { loading = false; return; }

  if (event.data === YT.PlayerState.UNSTARTED && previousStates.length > 1 && previousStates[previousStates.length - 1] === YT.PlayerState.BUFFERING && previousStates[previousStates.length - 2] === YT.PlayerState.UNSTARTED) {
    previousStates.length = 0;
    // Check if video is unavailable

    let http = new XMLHttpRequest();
    http.onreadystatechange = () => {
      if (http.readyState === 4) {
        console.log('STATUS', http);
      }
    }
    http.open('GET', 'https://img.youtube.com/vi/' + player.getVideoData().video_id + '/0.jpg', true);
    http.send(null);
  }
  // if (event.data === YT.PlayerState.UNSTARTED && lastPlayerState === YT.PlayerState.BUFFERING) {
  //   // 'Video unavailable'
  //   setTitleOfVideoID(player.getVideoData().video_id, TITLE_UNAVAILABLE);

  //   let loopType = getLoopType();
  //   if (loopType === 'none') {
  //     next('none');
  //   } else if (loopType === 'all') {
  //     // Only loop a maximum of one "spin"
  //     if (firstUnavailableVideoIndex === currentIndex) {
  //       return;
  //     } else if (firstUnavailableVideoIndex == null) {
  //       firstUnavailableVideoIndex = currentIndex;
  //     }

  //     next('all');
  //   } // if loopType === 'one', do nothing
  // } else
  if (event.data === YT.PlayerState.ENDED) {
    next(getLoopType());
    previousStates.length = 0;
  } else if (event.data === YT.PlayerState.PLAYING) {
    firstUnavailableVideoIndex = null;
    setTitleOfVideoID(player.getVideoData().video_id, player.getVideoData().title);
    setPageTitle(player.getVideoData().title);
    previousStates.length = 0;
  }

  previousStates.push(event.data);
  // console.log('PREV', previousStates);
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