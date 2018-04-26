import * as THREE from "../node_modules/three";
import {sample, random} from "../node_modules/underscore";

import {Constants, Scales, Controls} from "./AppData";
import ToneMatrix from "./ToneMatrix";
import Rippleizer from "./Rippleizer";
import ScaleChooser from "./ScaleChooser";
import RippleSynth from "./RippleSynth";
import ControlPanel from "./ControlPanel";

import Tone from "../node_modules/Tone";

var app = {};
var currentScale = sample(Object.values(Scales));

var container = document.getElementById("container");
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
var width = window.innerWidth;
var height = window.innerHeight;
renderer.setSize(width, height);
container.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 100);
camera.position.set(width/2, height/2, 50);

var toneMatrix = new ToneMatrix(Constants.NUM_STEPS, Constants.NUM_STEPS);
var toneMatrixSize = Math.min(width, height) * 0.8;
toneMatrix.scale.set(toneMatrixSize, toneMatrixSize, 1);
toneMatrix.shadowGroup.scale.set(toneMatrixSize, toneMatrixSize, 1);
toneMatrix.position.set(width/2, height/2, 1);
toneMatrix.armButton(0, random(0, Constants.NUM_STEPS - 1)); // Arm random button
scene.add(toneMatrix);

var rippleizer = new Rippleizer(renderer, toneMatrix.shadowGroup);

var scaleChooser = new ScaleChooser(Scales);
scaleChooser.position.x = width/2;
scaleChooser.scale.set(toneMatrixSize/Constants.NUM_STEPS, toneMatrixSize/Constants.NUM_STEPS, 1);
scene.add(scaleChooser);

// SYNTH
var synth = new RippleSynth(Constants.NUM_STEPS);
// var synth = new RippleSynth(1);
synth.setVolume(-6);

// Controls for the envelope
var controlPanelLayout = (width > height) ? "vertical" : "horizontal";
var availableSpace = height - (height/2 + toneMatrixSize/2);
var controlPanelHeight = availableSpace * 0.7;
var controlPanelWidth = width;
if (controlPanelLayout === "vertical") {
  availableSpace = width - (width/2 + toneMatrixSize/2);
  controlPanelWidth = availableSpace * 0.7;
  controlPanelHeight = height;
}
var envelopeControl = new ControlPanel(Object.assign(Controls.Envelope, {
  width: controlPanelWidth,
  height: controlPanelHeight,
  getter: synth.getEnvelope,
  setter: synth.setEnvelope,
}));
scene.add(envelopeControl);
if (controlPanelLayout === "vertical") { // On the right side
  envelopeControl.position.x = (3 * width + toneMatrixSize) / 4;
  envelopeControl.position.y = height/2;
} else { // On the top
  envelopeControl.position.x = width/2;
  envelopeControl.position.y = (3 * height + toneMatrixSize) / 4;
}
envelopeControl.visible = false;

// var filterEnvelopeControl = new ControlPanel(Object.assign(Controls.FilterEnvelope, {
//   width: controlPanelWidth,
//   height: controlPanelHeight,
//   getter: synth.getFilterEnvelope,
//   setter: synth.setFilterEnvelope,
// }));
// scene.add(filterEnvelopeControl);
// if (controlPanelLayout === "vertical") { // On the right side
//   filterEnvelopeControl.position.x = (3 * width + toneMatrixSize) / 4;
//   filterEnvelopeControl.position.y = height/2;
// } else { // On the top
//   filterEnvelopeControl.position.x = width/2;
//   filterEnvelopeControl.position.y = (3 * height + toneMatrixSize) / 4;
// }
// filterEnvelopeControl.visible = false;

var filterControl = new ControlPanel(Object.assign(Controls.Filter, {
  width: controlPanelWidth,
  height: controlPanelHeight,
  getter: synth.getFilter,
  setter: synth.setFilter,
}));
scene.add(filterControl);
if (controlPanelLayout === "vertical") { // On the left side
  filterControl.position.x = (width - toneMatrixSize) / 4;
  filterControl.position.y = height/2;
} else { // On the top
  filterControl.position.x = width/2;
  filterControl.position.y = (3 * height + toneMatrixSize) / 4;
}
filterControl.visible = false;

// Click handler
var raycaster = new THREE.Raycaster();
function onDocumentMouseMove(event) {
  if (event.which === 1) { // Mouse is down
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / width) * 2 - 1;
    mouse.y = -(event.clientY / height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    toneMatrix.touch(raycaster);
    if (filterControl.visible) {
      // envelopeControl.touch(raycaster, event);
      // filterEnvelopeControl.touch(raycaster, event);
      filterControl.touch(raycaster, event);
    }
  }
}
function onDocumentMouseDown(event) {
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / width) * 2 - 1;
  mouse.y = -(event.clientY / height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  toneMatrix.touchStart(raycaster);
  scaleChooser.touchStart(raycaster);
  if (filterControl.visible) {
    // envelopeControl.touchStart(raycaster, event);
    // filterEnvelopeControl.touchStart(raycaster, event);
    filterControl.touchStart(raycaster, event);
  }
  onDocumentMouseMove(event);
}
function onDocumentMouseUp(event) {
  if (filterControl.visible) {
    // envelopeControl.touchEnd();
    // filterEnvelopeControl.touchEnd();
    filterControl.touchEnd();
  }
  toneMatrix.touchEnd();
}
var MUTED = false;
function onDocumentKeyPress(event) {
  if (event.key === "c") {
    toneMatrix.clear();
  } else if (event.key === "m") {
    MUTED = !MUTED;
    toneMatrix.mute(MUTED);
    envelopeControl.setColor(new THREE.Color(currentScale.color).multiplyScalar(
      THREE.Math.lerp(1.0, Constants.MUTE_COLOR_VALUE, MUTED)
    ));
    // filterEnvelopeControl.setColor(new THREE.Color(currentScale.color).multiplyScalar(
    //   THREE.Math.lerp(1.0, Constants.MUTE_COLOR_VALUE, MUTED)
    // ));
    filterControl.setColor(new THREE.Color(currentScale.color).multiplyScalar(
      THREE.Math.lerp(1.0, Constants.MUTE_COLOR_VALUE, MUTED)
    ));
  }
}
document.addEventListener("mousemove", onDocumentMouseMove, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("mouseup", onDocumentMouseUp, false);
document.addEventListener("keypress", onDocumentKeyPress, false);

app.setScale = function(newScale) {
  currentScale = newScale;
  toneMatrix.setActiveColor({
    buttonColor: new THREE.Color(currentScale.color),
    shadowColor: new THREE.Color(currentScale.ripple_color),
  });
  envelopeControl.setColor(new THREE.Color(currentScale.color));
  // filterEnvelopeControl.setColor(new THREE.Color(currentScale.color));
  filterControl.setColor(new THREE.Color(currentScale.color));
};


function playRow(row) {
  var currentNotes = currentScale.notes;
  var currentOctaves = currentScale.octaves;
  if (Constants.RELATIVE) {
    currentNotes = currentScale.relative_notes;
    currentOctaves = currentScale.relative_octaves;
  }
  var note = currentNotes[(row) % currentNotes.length];
  var octave = Math.floor(row / currentNotes.length) + 3;
  octave += currentOctaves[(row) % currentNotes.length];
  // Duration of an 8th note
  synth.triggerAttackRelease(note + octave, "8n");
}

var previousPosition = Constants.NUM_STEPS - 1;
var startTime;
var numNotesPlayed = new Array(Constants.NUM_STEPS).fill(0); // Hacky activity monitor
function update() {
  var beats = (performance.now() - startTime) / 1000 / 60 * Controls.TEMPO;
  var position = beats * (1/4 / Constants.STEP_VALUE);
  if (Math.floor(position) % 2 === 1) {
    position += Controls.SWING;
  }
  position = Math.floor(position % Constants.NUM_STEPS);

  if (position !== previousPosition) {
    toneMatrix.deactivateColumn(previousPosition);
    previousPosition = position;
    var rowsToPlay = toneMatrix.activateColumn(position, MUTED);
    if (!MUTED) {
      numNotesPlayed[position] = rowsToPlay.length;
      rowsToPlay.forEach(function(row) {
        playRow(row);
      });
    }
  }

  if (!filterControl.visible) {
    var sum = 0;
    for (let i = 0; i < numNotesPlayed.length; i++) {
      sum += numNotesPlayed[i];
    }
    if (sum > Controls.NUM_NOTES_BEFORE_ENVELOPE_DISPLAY) {
      // envelopeControl.visible = true;
      // filterEnvelopeControl.visible = true;
      filterControl.visible = true;
    }
  }

  rippleizer.render();
  toneMatrix.setRippleTexture(rippleizer.getActiveTexture());
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

renderer.render(scene, camera);
window.setTimeout(function() {
  app.setScale(currentScale);
  startTime = performance.now();
  update();
}, 100);

// export some globals
window.app = Object.assign(app, {
  synth: synth,
  Tone: Tone,
});
window.THREE = THREE;
console.log(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
