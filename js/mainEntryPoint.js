// import * as THREE from "../node_modules/three";
import Tone from "../node_modules/Tone";

import Application from "./Application";
import {Constants} from "./AppData";

window.app = new Application("#app", window.innerWidth, window.innerHeight, {
  numSteps: Constants.NUM_STEPS,
  numNotes: Constants.NUM_STEPS,
});

// HANDLERS
function onDocumentMouseMove(event) {
  if (event.which === 1) { // Mouse is down
    window.app.touch(event);
  }
}
function onDocumentMouseDown(event) {
  Tone.context.resume(); // TODO
  window.app.touchStart(event);
}
function onDocumentMouseUp(event) {
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
document.addEventListener("mousemove", onDocumentMouseMove, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("mouseup", onDocumentMouseUp, false);
// document.addEventListener("touchmove", onDocumentMouseMove, false);
// document.addEventListener("touchstart", onDocumentMouseDown, false);
// document.addEventListener("touchend", onDocumentMouseUp, false);
document.addEventListener("keypress", onDocumentKeyPress, false);
window.onresize = windowResize;

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
