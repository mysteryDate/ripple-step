import * as THREE from "../node_modules/three/build/three.min.js";
import Tone from "../node_modules/Tone/build/Tone.min.js";
import Stats from "../node_modules/stats.js";

import Application from "./Application";
import {Constants} from "./AppData";

var isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
window.app = new Application("#app", window.innerWidth, window.innerHeight, {
  numSteps: Constants.NUM_STEPS,
  numNotes: Constants.NUM_STEPS,
  isMobile: isMobile,
});
var hasInteracted = false;
var interactionGate = document.getElementById("interactionGate");

// HANDLERS
function touchMove(event) {
  event.preventDefault();
  window.app.touch(event);
}
function touchStart(event) {
  if (!hasInteracted) {
    window.app.start();
    Tone.context.resume(); // TODO
    interactionGate.style.display = "none";
    hasInteracted = true;
  } else {
    window.app.touchStart(event);
  }
}
function touchEnd(event) {
  window.app.touchEnd();
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
document.addEventListener("mousemove", touchMove, false);
document.addEventListener("mousedown", touchStart, false);
document.addEventListener("mouseup", touchEnd, false);
document.addEventListener("touchmove", touchMove, false);
document.addEventListener("touchstart", touchStart, false);
document.addEventListener("touchend", touchEnd, false);
document.addEventListener("keypress", onDocumentKeyPress, false);
window.onresize = windowResize;

var canvas = document.getElementById("app");
canvas.addEventListener("touchmove", function(event) {
  event.preventDefault();
});

var stats = new Stats();
function update() {
  stats.update();
  window.app.update();
  window.app.render();
  requestAnimationFrame(update);
}

window.onresize();
window.app.render();

window.onload = function() {
  var domElement = document.getElementById("soundOn");
  domElement.innerHTML = "SOUND ON!<br>▶︎";
  domElement.style.top = "calc(50% - 28vw)";
  domElement.style.animationName = "fade";
  domElement.style.animationIterationCount = 1;
  domElement.style.animationDuration = "0.5s";


  // document.body.appendChild(stats.domElement);

  window.setTimeout(function() {
    window.app.setScale(window.app.currentScale);
    update();
  }, 0);
};

// export some globals
window.Tone = Tone;
window.THREE = THREE;
