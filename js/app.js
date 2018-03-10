import * as THREE from "../node_modules/three";
import {sample, random} from "../node_modules/underscore";

import {Constants, Scales, Controls} from "./AppData";
import ToneMatrix from "./ToneMatrix";
import Rippleizer from "./Rippleizer";
import ScaleChooser from "./ScaleChooser";
import RippleSynth from "./RippleSynth";
import Knob from "./Knob";

var app = {};
var currentScale = sample(Object.values(Scales));

var container = document.getElementById("container");
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0.1, 100);
camera.position.set(window.innerWidth/2, window.innerHeight/2, 50);

var toneMatrix = new ToneMatrix(Constants.NUM_STEPS, Constants.NUM_STEPS);
var toneMatrixSize = Math.min(window.innerWidth, window.innerHeight) * 0.8;
toneMatrix.scale.set(toneMatrixSize, toneMatrixSize, 1);
toneMatrix.shadowGroup.scale.set(toneMatrixSize, toneMatrixSize, 1);
toneMatrix.position.set(window.innerWidth/2, window.innerHeight/2, 1);
toneMatrix.armButton(0, random(0, Constants.NUM_STEPS - 1)); // Arm random button
scene.add(toneMatrix);

var rippleizer = new Rippleizer(renderer, toneMatrix.shadowGroup);

var scaleChooser = new ScaleChooser(Scales);
scaleChooser.position.x = window.innerWidth/2;
scene.add(scaleChooser);

// SYNTH
var synth = new RippleSynth(Constants.NUM_STEPS);
synth.setVolume(-24);

var envelopeNames = ["attack", "decay", "sustain", "release"];
var ranges = [[0.005, 0.2], [0.005, 10.0], [0.0, 1.0], [0.0, 10.0]];
var knobRadius = toneMatrixSize/16;
function makeKnobs() {
  var knobs = new THREE.Group();
  for (var i = 0; i < envelopeNames.length; i++) {
    var knob = new Knob({
      currentValue: synth.getEnvelope(envelopeNames[i]),
      minValue: ranges[i][0],
      maxValue: ranges[i][1],
      size: knobRadius,
      sensitivity: 2,
      control: envelopeNames[i],
    });
    knobs.add(knob);
    knob.position.y = knobRadius * (2 * i - 3);
  }
  return knobs;
}
var knobs = makeKnobs();
knobs.position.x = (window.innerWidth + window.innerWidth/2 + toneMatrixSize/2) / 2;
knobs.position.y = window.innerHeight/2;
scene.add(knobs);

// Click handler
var raycaster = new THREE.Raycaster();
function onDocumentMouseMove(event) {
  if (event.buttons === 1) { // Mouse is down
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    toneMatrix.touch(raycaster);
  }
  knobs.children.forEach(function(knob) {
    knob.touch(new THREE.Vector2(event.clientX, -event.clientY));
    synth.setEnvelope(knob.control, knob.getValue());
  });
}
function onDocumentMouseDown(event) {
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  toneMatrix.touchStart(raycaster);
  scaleChooser.touchStart(raycaster);
  knobs.children.forEach(function(knob) {
    knob.touchStart(raycaster, new THREE.Vector2(event.clientX, -event.clientY));
  });
  onDocumentMouseMove(event);
}
function onDocumentMouseUp(event) {
  knobs.children.forEach(function(knob) {
    knob.touchEnd();
  });
}
function onDocumentKeyPress(event) {
  if (event.key === "c") {
    toneMatrix.clear();
  }
}
document.addEventListener("mousemove", onDocumentMouseMove, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("mouseup", onDocumentMouseUp, false);
document.addEventListener("keypress", onDocumentKeyPress, false);

app.setScale = function(newScale) {
  currentScale = newScale;
  toneMatrix.setActiveColor(new THREE.Color(currentScale.ripple_color), new THREE.Color(currentScale.ripple_color));
  knobs.children.forEach(function(knob) {
    knob.setColor(new THREE.Color(currentScale.ripple_color));
  });
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
    var rowsToPlay = toneMatrix.activateColumn(position);
    rowsToPlay.forEach(function(row) {
      playRow(row);
    });
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
  scene: scene,
  rippleizer: rippleizer,
  synth: synth,
  toneMatrix: toneMatrix,
  knobs: knobs,
});
window.THREE = THREE;
