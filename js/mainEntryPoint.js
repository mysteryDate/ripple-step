import * as THREE from "../node_modules/three";

import Application from "./Application";
import {Constants, Controls} from "./AppData";
import Rippleizer from "./Rippleizer";

import Tone from "../node_modules/Tone";

window.app = new Application("#app", window.innerWidth, window.innerHeight, {
  numSteps: Constants.NUM_STEPS,
  numNotes: Constants.NUM_STEPS,
});

// Application.prototype.setup = function() {
// }

// Click handler
var raycaster = new THREE.Raycaster();
function onDocumentMouseMove(event) {
  if (event.which === 1) { // Mouse is down
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.app.width) * 2 - 1;
    mouse.y = -(event.clientY / window.app.height) * 2 + 1;
    raycaster.setFromCamera(mouse, window.app.camera);
    window.app.toneMatrix.touch(raycaster);
    if (window.app.knobPanel.visible) {
      window.app.knobPanel.touch(raycaster, event);
    }
  }
}
function onDocumentMouseDown(event) {
  Tone.context.resume();
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.app.width) * 2 - 1;
  mouse.y = -(event.clientY / window.app.height) * 2 + 1;
  raycaster.setFromCamera(mouse, window.app.camera);
  window.app.toneMatrix.touchStart(raycaster);
  window.app.scaleChooser.touchStart(raycaster);
  if (window.app.knobPanel.visible) {
    window.app.knobPanel.touchStart(raycaster, event);
  }
  onDocumentMouseMove(event);
}
function onDocumentMouseUp(event) {
  if (window.app.knobPanel.visible) {
    window.app.knobPanel.touchEnd();
  }
  window.app.toneMatrix.touchEnd();
}
var MUTED = false;
function onDocumentKeyPress(event) {
  if (event.key === "c") {
    window.app.toneMatrix.clear();
  } else if (event.key === "m") {
    MUTED = !MUTED;
    window.app.toneMatrix.mute(MUTED);
    window.app.knobPanel.setColor(new THREE.Color(window.app.currentScale.color).multiplyScalar(
      THREE.Math.lerp(1.0, Constants.MUTE_COLOR_VALUE, MUTED)
    ));
  }
}

function windowResize(event) {
  window.app.width = window.innerWidth;
  window.app.height = window.innerHeight;
  window.app.renderer.setSize(window.app.width, window.app.height);
  window.app.camera = new THREE.OrthographicCamera(-window.app.width/2, window.app.width/2, window.app.height/2, -window.app.height/2, 0.1, 100);
  window.app.camera.position.set(window.app.width/2, window.app.height/2, 50);

  var toneMatrixSize = Math.min(window.app.width, window.app.height) * 0.8;
  window.app.toneMatrix.scale.set(toneMatrixSize, toneMatrixSize, 1);
  window.app.toneMatrix.position.set(window.app.width/2, window.app.height/2, 1);
  window.app.toneMatrix.shadowGroup.scale.set(toneMatrixSize, toneMatrixSize, 1);
  window.app.rippleizer = new Rippleizer(window.app.renderer, window.app.toneMatrix.shadowGroup);

  window.app.scaleChooser.position.x = window.app.width/2;
  window.app.scaleChooser.scale.set(toneMatrixSize/Constants.NUM_STEPS, toneMatrixSize/Constants.NUM_STEPS, 1);

  var controlPanelLayout = (window.app.width > window.app.height) ? "vertical" : "horizontal";
  var availableSpace = window.app.height - (window.app.height/2 + toneMatrixSize/2);
  var controlPanelHeight = availableSpace * 0.7;
  var controlPanelWidth = window.app.width;
  if (controlPanelLayout === "vertical") {
    availableSpace = window.app.width - (window.app.width/2 + toneMatrixSize/2);
    controlPanelWidth = availableSpace * 0.7;
    controlPanelHeight = window.app.height;
  }

  window.app.knobPanel.resize(controlPanelWidth, controlPanelHeight);
  if (controlPanelLayout === "vertical") { // On the right side
    window.app.knobPanel.position.x = (3 * window.app.width + toneMatrixSize) / 4;
    window.app.knobPanel.position.y = window.app.height/2;
  } else { // On the top
    window.app.knobPanel.position.x = window.app.width/2;
    window.app.knobPanel.position.y = (3 * window.app.height + toneMatrixSize) / 4;
  }
}
document.addEventListener("mousemove", onDocumentMouseMove, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("mouseup", onDocumentMouseUp, false);
document.addEventListener("keypress", onDocumentKeyPress, false);
window.onresize = windowResize;

var setScale = function(newScale) {
  window.app.currentScale = newScale;
  window.app.toneMatrix.setActiveColor({
    buttonColor: new THREE.Color(window.app.currentScale.color),
    shadowColor: new THREE.Color(window.app.currentScale.ripple_color),
  });
  window.app.knobPanel.setColor(new THREE.Color(window.app.currentScale.color));
};

function playRow(row) {
  var currentNotes = window.app.currentScale.notes;
  var currentOctaves = window.app.currentScale.octaves;
  if (Constants.RELATIVE) {
    currentNotes = window.app.currentScale.relative_notes;
    currentOctaves = window.app.currentScale.relative_octaves;
  }
  var note = currentNotes[(row) % currentNotes.length];
  var octave = Math.floor(row / currentNotes.length) + 3;
  // var octave = Math.floor(row / currentNotes.length);
  octave += currentOctaves[(row) % currentNotes.length];
  // Duration of an 8th note
  window.app.synth.triggerAttackRelease(note + octave, "16n");
}

var previousPosition = Constants.NUM_STEPS - 1;
var startTime;
var numNotesPlayed = new Array(Constants.NUM_STEPS).fill(0); // Hacky activity monitor
function update() {
  var beats = (performance.now() - startTime) / 1000 / 60 * Controls.TEMPO;
  var position = beats * (1/4 / Constants.STEP_VALUE);
  if (Math.floor(position) % 2 === 1) {
    position += window.app.synth.getControl("swing");
  }
  position = Math.floor(position % Constants.NUM_STEPS);

  if (position !== previousPosition) {
    window.app.toneMatrix.deactivateColumn(previousPosition);
    previousPosition = position;
    var rowsToPlay = window.app.toneMatrix.activateColumn(position, MUTED);
    if (!MUTED) {
      numNotesPlayed[position] = rowsToPlay.length;
      rowsToPlay.forEach(function(row) {
        playRow(row);
      });
    }
  }

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

  if (!window.app.knobPanel.visible) {
    var sum = 0;
    for (let i = 0; i < numNotesPlayed.length; i++) {
      sum += numNotesPlayed[i];
    }
    if (sum > Controls.NUM_NOTES_BEFORE_KNOBS_DISPLAY) {
      window.app.knobPanel.visible = true;
    }
  }

  window.app.rippleizer.render();
  window.app.toneMatrix.setRippleTexture(window.app.rippleizer.getActiveTexture());
  window.app.renderer.render(window.app.scene, window.app.camera);
  requestAnimationFrame(update);
}

window.onresize();
window.app.renderer.render(window.app.scene, window.app.camera);
window.setTimeout(function() {
  setScale(window.app.currentScale);
  startTime = performance.now();
  update();
}, 100);

// export some globals
window.Tone = Tone;
window.THREE = THREE;
// console.log(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
