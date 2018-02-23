import * as THREE from "./node_modules/three";
import Tone from "./node_modules/Tone";
import {sample, random} from "./node_modules/underscore";

import {Constants, Scales, Controls} from "./AppData";
import {blitTexture} from "./Graphics";
import Materials from "./Materials";
import ToneMatrix from "./ToneMatrix";

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
toneMatrix.setActiveColor(new THREE.Color(currentScale.ripple_color), new THREE.Color(currentScale.ripple_color));
toneMatrix.armButton(random(0, Constants.NUM_STEPS - 1), random(0, Constants.NUM_STEPS - 1));
scene.add(toneMatrix);

var scaleChooser = new THREE.Group();
Object.keys(Scales).forEach(function(scale, index) {
  var pickerKey = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(Constants.MATRIX_KEY_SIZE, Constants.MATRIX_KEY_SIZE),
    new THREE.MeshBasicMaterial({color: Scales[scale].ripple_color})
  );
  scaleChooser.add(pickerKey);
  pickerKey.position.set(index * (Constants.MATRIX_KEY_SIZE * (1 + Constants.SPACING_RATIO)), 0, 0);
  pickerKey.position.x -= 2.5 * (Constants.MATRIX_KEY_SIZE * (1 + Constants.SPACING_RATIO)); // Center it
  pickerKey.scaleName = scale;
});
scaleChooser.position.x = window.innerWidth/2;
scene.add(scaleChooser);

// Click handler
var raycaster = new THREE.Raycaster();
function onDocumentMouseMove(event) {
  if (event.buttons === 1) { // Mouse is down
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    toneMatrix.touch(raycaster);
    var clickedScale = raycaster.intersectObjects(scaleChooser.children)[0];
    if (clickedScale !== undefined) {
      currentScale = Scales[clickedScale.object.scaleName];
      toneMatrix.setActiveColor(new THREE.Color(currentScale.ripple_color), new THREE.Color(currentScale.ripple_color));
    }
  }
}
function onDocumentMouseDown(event) {
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  toneMatrix.touchStart(raycaster);
  onDocumentMouseMove(event);
}
document.addEventListener("mousemove", onDocumentMouseMove, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);

// SYNTH
// create a synth and connect it to the master output (your speakers)
var synth = new Tone.PolySynth(Constants.NUM_STEPS, Tone.Synth).toMaster();
Tone.Master.volume.value = -24;
// var synth = new Tone.Synth().toMaster();

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

// var PADDING = 1/Constants.NUM_STEPS * 2;
var PADDING = 0;
// For off-screen, ripple renders
function makeShadowScene() {
  var rippleGroup = toneMatrix.shadowGroup;
  var subScene = new THREE.Scene();
  subScene.add(rippleGroup);
  var boundingBox = new THREE.Box3().setFromObject(rippleGroup);
  var bbSize = boundingBox.getSize();
  var subCamera = new THREE.OrthographicCamera(-(1 + PADDING) * bbSize.x/2, (1 + PADDING) * bbSize.x/2, (1 + PADDING) * bbSize.y/2, -(1 + PADDING) * bbSize.y/2, 0.1, 100);
  var target = new THREE.WebGLRenderTarget((1 + PADDING) * bbSize.x, (1 + PADDING) * bbSize.y);
  subCamera.position.copy(boundingBox.getCenter());
  subCamera.position.z = 10;

  return {
    scene: subScene,
    camera: subCamera,
    target: target,
  };
}
var shadowScene = makeShadowScene();

var rippleMaterial = Materials.ripple();
rippleMaterial.uniforms.u_sceneTex.value = shadowScene.target.texture;
var ratio = 0.2;
var rippleTex0 = new THREE.WebGLRenderTarget(ratio * shadowScene.target.width, ratio * shadowScene.target.height);
var rippleTex1 = new THREE.WebGLRenderTarget(ratio * shadowScene.target.width, ratio * shadowScene.target.height);
var rippleTex2 = new THREE.WebGLRenderTarget(ratio * shadowScene.target.width, ratio * shadowScene.target.height);
var ripplePtr = 0;
var rippleTargets = [rippleTex0, rippleTex1, rippleTex2];
rippleMaterial.uniforms.u_mainTex.value = rippleTex0;
rippleMaterial.uniforms.u_backTex.value = rippleTex1;
rippleMaterial.uniforms.u_texelSize.value = new THREE.Vector2(1/(ratio * shadowScene.target.width), 1/(ratio * shadowScene.target.height));

var tmBB = new THREE.Box3().setFromObject(toneMatrix);
var tmSize = tmBB.getSize();
var g = new THREE.PlaneBufferGeometry((1 + PADDING) * tmSize.x, (1 + PADDING) * tmSize.y);
var mat = new THREE.MeshBasicMaterial({
  blending: THREE.AdditiveBlending,
  map: rippleTex2.texture,
  transparent: true,
  opacity: 1.0,
});
var overlayMesh = new THREE.Mesh(g, mat);
overlayMesh.position.copy(tmBB.getCenter());
// scene.add(overlayMesh);

var previousPosition = 0;
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

  renderer.render(scene, camera);
  // mat.opacity = Math.sin(performance.now() / 4000) * 0.4 + 0.4;
  renderer.render(shadowScene.scene, shadowScene.camera, shadowScene.target);

  for (var i = 0; i < 1; i++) {
    ripplePtr = (ripplePtr + 1) % 3;
    rippleMaterial.uniforms.u_mainTex.value = rippleTargets[(ripplePtr + 2) % 3].texture;
    rippleMaterial.uniforms.u_backTex.value = rippleTargets[(ripplePtr + 1) % 3].texture;
    blitTexture(renderer, rippleMaterial, rippleTargets[ripplePtr]);
  }
  mat.map = rippleTargets[ripplePtr].texture;
  toneMatrix.setRippleTexture(rippleTargets[ripplePtr].texture);
  // renderer.render(shadowScene.scene, shadowScene.camera);
  requestAnimationFrame(update);
}

renderer.render(scene, camera);
window.setTimeout(function() {
  startTime = performance.now();
  update();
}, 100);

window.renderer = renderer;
window.tm = toneMatrix;
// window.tm.visible = false;
window.synth = synth;
window.THREE = THREE;
window.scene = scene;
window.ss = shadowScene;
window.mat = mat;
window.Tone = Tone;
