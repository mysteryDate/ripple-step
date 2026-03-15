import Application from "./Application";
import {Constants} from "./AppData";

document.body.style.backgroundColor = Constants.BACKGROUND_COLOR;
var isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
var hasInteracted = false;
var interactionGate = document.getElementById("interactionGate");

// HANDLERS
function interactionCallback() {
  // AudioContext must be created inside a user gesture for mobile Chrome
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();

  window.app = new Application("#app", window.innerWidth, window.innerHeight, {
    audioContext: audioContext,
    numSteps: Constants.NUM_STEPS,
    numNotes: Constants.NUM_NOTES,
    isMobile: isMobile,
  });
  window.app.init();
  window.app.render();
  window.app.start();
  function mouseMove(event) {
    window.app.touch(event);
  }
  function touchMove(event) {
    event.pageX = event.changedTouches[0].pageX;
    event.pageY = event.changedTouches[0].pageY;
    mouseMove(event);
  }
  function mouseUp(event) {
    window.app.touchEnd();
  }
  function touchEnd(event) {
    mouseUp(event);
  }
  function onDocumentKeyPress(event) {
    switch (event.code) {
      case "KeyC":
        window.app.clear();
        break;
      case "KeyM":
        window.app.toggleMute();
        break;
      case "Space":
        window.app.togglePaused();
        break;
      default:
        break;
    }
  }
  function windowResize(event) {
    window.app.resize(window.innerWidth, window.innerHeight);
  }
  if (isMobile) {
    document.addEventListener("touchmove", touchMove, false);
    document.addEventListener("touchend", touchEnd, false);
  } else {
    document.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("mouseup", mouseUp, false);
    document.addEventListener("keypress", onDocumentKeyPress, false);
  }
  window.onresize = windowResize;
  function update() {
    window.app.update();
    window.app.render();
    requestAnimationFrame(update);
  }
  window.setTimeout(function() {
    update();
  }, 0);
}

window.onload = function() {
  var domElement = document.getElementById("soundOn");
  domElement.innerHTML = "SOUND ON!<br>▶︎";
  domElement.style.top = "calc(50% - 24vw)";
  domElement.style.lineHeight = "25vw";
  domElement.style.animationName = "fade";
  domElement.style.animationIterationCount = 1;
  domElement.style.animationDuration = "0.5s";

  // document.body.appendChild(stats.domElement);
  window.setTimeout(function() {
    mixpanel.track("App Started");
  }, 0);

  if (new URLSearchParams(window.location.search).has("skipGate")) {
    interactionGate.style.display = "none";
    hasInteracted = true;
    interactionCallback();
  }
};

function mouseDown(event) {
  if (!hasInteracted) {
    interactionGate.style.display = "none";
    hasInteracted = true;
    interactionCallback();
  } else {
    window.app.touchStart(event);
  }
}
function touchStart(event) {
  event.pageX = event.changedTouches[0].pageX;
  event.pageY = event.changedTouches[0].pageY;
  mouseDown(event);
}
if (isMobile) {
  document.addEventListener("touchstart", touchStart, false);
} else {
  document.addEventListener("mousedown", mouseDown, false);
}

var canvas = document.getElementById("app");
canvas.addEventListener("touchmove", function(event) {
  event.preventDefault();
});
