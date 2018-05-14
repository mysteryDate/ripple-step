// import * as THREE from "../node_modules/three";
import Tone from "../node_modules/Tone";

import Application from "./Application";
import {Constants} from "./AppData";

window.app = new Application("#app", window.innerWidth, window.innerHeight, {
  numSteps: Constants.NUM_STEPS,
  numNotes: Constants.NUM_STEPS,
});

// HANDLERS
function touchMove(event) {
  event.preventDefault();
  if (event.which === 1) { // Mouse is down
  }
  window.app.touch(event);
}
function touchStart(event) {
  Tone.context.resume(); // TODO
  window.app.touchStart(event);
}
function touchEnd(event) {
  window.app.touchEnd();
}
function onDocumentKeyPress(event) {
  if (event.key === "c") {
    window.app.clear();
  } else if (event.key === "m") {
    window.app.toggleMute();
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

function update() {
  window.app.update();
  window.app.render();
  requestAnimationFrame(update);
}

window.onresize();
window.app.render();
window.setTimeout(function() {
  window.app.setScale(window.app.currentScale);
  update();
}, 0);

// export some globals
window.Tone = Tone;
// window.THREE = THREE;
// console.log(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
