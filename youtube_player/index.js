var player;
var currentIndex = 0;
var DEFAULT_VIDEO = 'dQw4w9WgXcQ';

function playVideo(newIndex, firstTime) {
  setMinusDisable(false, currentIndex);
  currentIndex = newIndex;
  setMinusDisable(true, currentIndex);

  setIndexDisplay();

  if (!firstTime) {
    var videoID = getVideoID(document.getElementsByClassName('video')[currentIndex].id);
    if (videoID === '') {
      videoID = DEFAULT_VIDEO;
    }
    player.loadVideoById(videoID, 0, 'large');
  }
}

function setMinusDisable(value, index) {
  var buttons = document.getElementsByClassName('videoContainer')[index].getElementsByTagName('button');
  if (buttons.length == 3) {
    buttons[2].disabled = value;
  }
}

function setIndexDisplay() {
  document.getElementById('currentIndex').innerHTML = '(' + (currentIndex + 1) + ' / ' + document.getElementsByClassName('video').length + ')';
}

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

function findIndexOfID(id) {
  var videos = document.getElementsByClassName('video');
  for (var i = 0; i < videos.length; i++) {
    if (videos[i].id == id) {
      return i;
    }
  }
  return -1;
}

function play(id) {
  if (document.getElementById('player').tagName === 'DIV') {
    // Hasn't been initiated
    currentIndex = findIndexOfID(id);
    startYouTube();
  } else {
    playVideo(findIndexOfID(id), false);
  }
}

function plus(id) {
  var newID = document.getElementsByClassName('video').length;
  var tag = document.createElement('div');
  tag.id = 'video' + newID;
  tag.classList.add('videoContainer');

  var plussed = document.getElementById('video' + id);
  plussed.parentNode.insertBefore(tag, plussed.nextSibling);

  fillVideoContainer(tag, newID);
  setIndexDisplay();
}

function minus(id) {
  var index = findIndexOfID(id);
  var videoContainer = document.getElementById('video' + id);
  videoContainer.parentNode.removeChild(videoContainer);
  if (index < currentIndex) {
    currentIndex--;
  }
  setIndexDisplay();
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

  var minus = document.createElement('button');
  minus.type = 'button';
  minus.innerHTML = '-';
  minus.id = 'minus' + newID;
  tag.appendChild(minus);

  initVideoElement(newID);
}

function initVideoElement(id) {
  document.getElementById('play' + id).onclick = function() {
    play(id);
  }
  document.getElementById('plus' + id).onclick = function() {
    plus(id);
  }
  document.getElementById('minus' + id).onclick = function() {
    minus(id);
  }
}

function onStart() {
  startYouTube();
  var startingButton = document.getElementById('startingButton');
  startingButton.parentNode.removeChild(startingButton);
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    var newIndex = -1;
    var loopType = document.getElementById('loopType');
    var selection = loopType.options[loopType.selectedIndex].value;
    var total = document.getElementsByClassName('video').length;

    if (selection === 'all') {
      newIndex = (currentIndex + 1) % total;
    } else if (selection === 'one') {
      newIndex = currentIndex;
    } else if (selection === 'none') {
      newIndex = currentIndex + 1;
    }

    if (newIndex < total) {
      playVideo(newIndex, false);
    }
  }
}

function onYouTubeIframeAPIReady() {
  var video = getVideoID(currentIndex);
  if (video === '') {
    video = DEFAULT_VIDEO;
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

  playVideo(currentIndex, true);
}

window.onload = function() {
  fillVideoContainer(document.getElementsByClassName('videoContainer')[0], 0);
  var minus = document.getElementById('minus0');
  minus.parentElement.removeChild(minus);
}