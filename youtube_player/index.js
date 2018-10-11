var player;
var currentIndex = 0;

function startYouTube() {
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function getVideoID(id) {
  var video = document.getElementById(id).value;
  if (video.startsWith('https://')) {
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
  }
  return video;
}

function play(id) {
  player.loadVideoById(getVideoID(id), 0, 'large');
  currentIndex = parseInt(id);
}

function plus(id) {
  var newID = document.getElementsByClassName('video').length;
  var tag = document.createElement('div');
  tag.id = 'video' + newID;
  tag.classList.add('videoContainer');

  var plussed = document.getElementById('video' + id);
  plussed.parentNode.insertBefore(tag, plussed.nextSibling);

  fillVideoContainer(tag, newID);
}

function fillVideoContainer(tag, newID) {
  var play = document.createElement('button');
  play.type = 'button';
  play.innerHTML = 'Play';
  play.id = 'play' + newID;
  tag.appendChild(play);

  var input = document.createElement('input');
  input.id = newID;
  input.classList.add('video');
  input.type = 'text';
  tag.appendChild(input);

  var plus = document.createElement('button');
  plus.type = 'button';
  plus.innerHTML = '+';
  plus.id = 'plus' + newID;
  tag.appendChild(plus);

  initVideoElement(newID);
}

function initVideoElement(id) {
  document.getElementById('play' + id).onclick = function() {
    play(id);
  }
  document.getElementById('plus' + id).onclick = function() {
    plus(id);
  }
}

function onStart() {
  /* var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    console.log(videos[i].id);
  } */
  startYouTube();
  var startingButton = document.getElementById('startingButton');
  startingButton.parentNode.removeChild(startingButton);
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    var size = document.getElementsByClassName('video').length;
    currentIndex = (currentIndex + 1) % size;
    player.loadVideoById(getVideoID(currentIndex), 0, 'large');
  }
}

function onYouTubeIframeAPIReady() {
  var video = getVideoID(currentIndex);
  if (video === '') {
    video = 'dQw4w9WgXcQ';
  }

  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: video,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

window.onload = function() {
  fillVideoContainer(document.getElementsByClassName('videoContainer')[0], 0);
}