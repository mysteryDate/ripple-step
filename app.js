import * as THREE from "./node_modules/three";
import Tone from "./node_modules/Tone";

import {Constants, Scales, Controls} from "./AppData";

var currentScale = Scales.I;

function makeKeyShader() {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_baseColor: {value: new THREE.Color(Constants.BASE_COLOR)},
      u_activeColor: {value: new THREE.Color(currentScale.color)},
      u_armed: {value: 0},
      u_rowActive: {value: 0},
    },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 u_baseColor;
      uniform vec3 u_activeColor;
      uniform float u_armed;
      uniform float u_rowActive;
      void main() {
        vec3 col = mix(u_baseColor, u_activeColor, u_armed);
        col = mix(col, 2.0 * col, u_rowActive * u_armed);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

var container = document.getElementById("container");
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0.1, 100);
camera.position.set(window.innerWidth/2, window.innerHeight/2, 50);

var keyGeom = new THREE.PlaneBufferGeometry(Constants.MATRIX_KEY_SIZE, Constants.MATRIX_KEY_SIZE);
var keyGroup = new THREE.Group();
var i;
var j;
for (i = 0; i < Constants.NUM_STEPS; i++) {
  for (j = 0; j < Constants.NUM_STEPS; j++) {
    var mesh = new THREE.Mesh(keyGeom, makeKeyShader());
    keyGroup.add(mesh);
    mesh.position.set(i, j, 0);
    mesh.position.multiplyScalar(Constants.MATRIX_KEY_SIZE * (1 + Constants.SPACING_RATIO));
    mesh.position.add(new THREE.Vector3(Constants.MATRIX_KEY_SIZE/2, Constants.MATRIX_KEY_SIZE/2, 0)); // So the origin is the lower left
    mesh.note = j;
    mesh.row = i;
  }
}
var keyGroupBB = new THREE.Box3().setFromObject(keyGroup);
keyGroup.children[0].material.uniforms.u_armed.value = true;
keyGroup.position.sub(keyGroupBB.getCenter());
keyGroup.position.add(camera.position);
keyGroup.position.z = 0;
scene.add(keyGroup);

var scaleChooser = new THREE.Group();
Object.keys(Scales).forEach(function(scale, index) {
  var pickerKey = new THREE.Mesh(keyGeom, new THREE.MeshBasicMaterial({color: Scales[scale].color}));
  scaleChooser.add(pickerKey);
  pickerKey.position.set(index * (Constants.MATRIX_KEY_SIZE * (1 + Constants.SPACING_RATIO)), 0, 0);
  pickerKey.position.x -= 2.5 * (Constants.MATRIX_KEY_SIZE * (1 + Constants.SPACING_RATIO)); // Center it
  pickerKey.scaleName = scale;
});
scaleChooser.position.x = window.innerWidth/2;
scene.add(scaleChooser);

// SYNTH
// create a synth and connect it to the master output (your speakers)
var synth = new Tone.PolySynth(Constants.NUM_STEPS, Tone.Synth).toMaster();

// Click handler
var raycaster = new THREE.Raycaster();
var recentTrigger = null; // Hacky debouncing
var offOrOn = "on";
function onDocumentMouseMove(event) {
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  if (event.buttons === 1) {
    var clickedKey = raycaster.intersectObjects(keyGroup.children)[0];
    if (clickedKey !== undefined && recentTrigger !== clickedKey.object) {
      var clickedMesh = clickedKey.object;
      if (offOrOn === "on") {
        clickedMesh.material.uniforms.u_armed.value = true;
      } else {
        clickedMesh.material.uniforms.u_armed.value = false;
      }
      recentTrigger = clickedMesh;
    }
    var clickedScale = raycaster.intersectObjects(scaleChooser.children)[0];
    if (clickedScale !== undefined) {
      currentScale = Scales[clickedScale.object.scaleName];
      var currentColor = new THREE.Color(Scales[clickedScale.object.scaleName].color);
      keyGroup.children.forEach(function(key) {
        key.material.uniforms.u_activeColor.value = currentColor;
      });
    }
  }
}
function onDocumentMouseDown(event) {
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var clickedKey = raycaster.intersectObjects(keyGroup.children)[0];
  if (clickedKey !== undefined) {
    var clickedMesh = clickedKey.object;
    if (clickedMesh.material.uniforms.u_armed.value === true) {
      offOrOn = "off";
    } else {
      offOrOn = "on";
    }
  }
  onDocumentMouseMove(event);
}
function onDocumentMouseUp(event) {
  recentTrigger = null;
}
document.addEventListener("mousemove", onDocumentMouseMove, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("mouseup", onDocumentMouseUp, false);

var previousPosition = 0;
var triggerNotes = false;
function update() {
  var beats = performance.now() / 1000 / 60 * Controls.TEMPO;
  var position = beats * (1/4 / Constants.STEP_VALUE);
  if (Math.floor(position) % 2 === 1) {
    position += Controls.SWING;
  }
  position = Math.floor(position % Constants.NUM_STEPS);

  if (position !== previousPosition) {
    triggerNotes = true;
    previousPosition = position;
  } else {
    triggerNotes = false;
  }

  keyGroup.children.forEach(function(keyMesh) {
    if (keyMesh.row === position) {
      keyMesh.material.uniforms.u_rowActive.value = 1;
      if (triggerNotes && keyMesh.material.uniforms.u_armed.value > 0) {
        var currentNotes = currentScale.notes;
        var currentOctaves = currentScale.octaves;
        if (Constants.RELATIVE) {
          currentNotes = currentScale.relative_notes;
          currentOctaves = currentScale.relative_octaves;
        }
        var note = currentNotes[(keyMesh.note) % currentNotes.length];
        var octave = Math.floor(keyMesh.note / currentNotes.length) + 3;
        octave += currentOctaves[(keyMesh.note) % currentNotes.length];
        // Duration of an 8th note
        synth.triggerAttackRelease(note + octave, "8n");
      }
    } else {
      keyMesh.material.uniforms.u_rowActive.value = 0;
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}
update();

window.Constants = Constants;
