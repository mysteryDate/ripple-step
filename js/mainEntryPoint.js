import * as THREE from "../node_modules/three";
import Tone from "../node_modules/Tone";

import Application from "./Application";
import {Constants, Controls} from "./AppData";

window.app = new Application("#app", window.innerWidth, window.innerHeight, {
  numSteps: Constants.NUM_STEPS,
  numNotes: Constants.NUM_STEPS,
});

// HANDLERS
function onDocumentMouseMove(event) {
  if (event.which === 1) { // Mouse is down
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.app.width) * 2 - 1;
    mouse.y = -(event.clientY / window.app.height) * 2 + 1;
    window.app.touch(mouse);
  }
}
function onDocumentMouseDown(event) {
  Tone.context.resume(); // TODO
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.app.width) * 2 - 1;
  mouse.y = -(event.clientY / window.app.height) * 2 + 1;
  window.app.touchStart(mouse);
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
document.addEventListener("keypress", onDocumentKeyPress, false);
window.onresize = windowResize;

function update() {
  window.app.update();

  // TODO, this is hideous
  window.app.rippleizer.damping.value = (function getRelease() {
    var release = window.app.synth.getControl("release");
    var minRelease = Controls.Envelope.release.minValue;
    var maxRelease = Controls.Envelope.release.maxValue;
    var dampingValue;
    var firstStop = 0.05;
    if (release < THREE.Math.lerp(minRelease, maxRelease, firstStop)) {
      dampingValue = THREE.Math.mapLinear(release, minRelease, THREE.Math.lerp(minRelease, maxRelease, firstStop), 0.9, 0.995);
    } else if (release === Controls.Envelope.release.maxValue) {
      dampingValue = 1;
    } else {
      dampingValue = THREE.Math.mapLinear(release, THREE.Math.lerp(minRelease, maxRelease, firstStop), maxRelease, 0.995, 0.999);
    }
    return dampingValue;
  })();

  // TODO
  // if (!window.app.knobPanel.visible) {
  //   var sum = 0;
  //   for (let i = 0; i < numNotesPlayed.length; i++) {
  //     sum += numNotesPlayed[i];
  //   }
  //   if (sum > Controls.NUM_NOTES_BEFORE_KNOBS_DISPLAY) {
  //     window.app.knobPanel.visible = true;
  //   }
  // }

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
window.THREE = THREE;
// console.log(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
