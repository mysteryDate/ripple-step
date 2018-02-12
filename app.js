const THREE = require("three"); // TODO webpack?
// const Tone = require("tone");
import bar from "./foo";
import Tone from "./node_modules/Tone";

bar();

var BASE_COLOR = new THREE.Color(0x54576b);
var SCALES = {
  "I": {
    "notes": ["C", "D", "E", "G", "A"],
    "octaves": [0, 0, 0, 0, 0],
    "color": new THREE.Color(0xbf4944),
  },
  "IV": {
    // "notes": ["C", "D", "F", "G", "A"],
    "notes": ["F", "G", "A", "C", "D"],
    "octaves": [0, 0, 0, 1, 1],
    "color": new THREE.Color(0xc3c045),
  },
  "V": {
    // "notes": ["B", "D", "F", "G", "A"],
    "notes": ["G", "A", "B", "D", "F"],
    "octaves": [-1, -1, -1, 0, 0],
    "color": new THREE.Color(0xc08032),
  },
  "ii": {
    // "notes": ["B", "D", "E", "F", "A"],
    "notes": ["D", "E", "F", "A", "B"],
    "octaves": [0, 0, 0, 0, 0],
    "color": new THREE.Color(0x6bbc5a),
  },
  "vi": {
    // "notes": ["B", "C", "E", "F", "A"],
    "notes": ["A", "B", "C", "E", "F"],
    "octaves": [-1, -1, 0, 0, 0],
    "color": new THREE.Color(0x5455b7),
  },
  "iii": {
    // "notes": ["B", "C", "E", "F", "G"],
    "notes": ["E", "F", "G", "B", "C"],
    "octaves": [0, 0, 0, 0, 1],
    "color": new THREE.Color(0x8a49bd),
  },
};
var currentScale = SCALES.I;

function makeKeyShader() {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_baseColor: {value: BASE_COLOR},
      u_activeColor: {value: SCALES.I.color},
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

var NUM_STEPS = 16;
var KEY_SIZE = 40;
var SPACING = KEY_SIZE/10;
var keyGeom = new THREE.PlaneBufferGeometry(KEY_SIZE, KEY_SIZE);
var keyGroup = new THREE.Group();
var i;
var j;
for (i = 0; i < NUM_STEPS; i++) {
  for (j = 0; j < NUM_STEPS; j++) {
    var mesh = new THREE.Mesh(keyGeom, makeKeyShader());
    keyGroup.add(mesh);
    mesh.position.set(i, j, 0);
    mesh.position.multiplyScalar(KEY_SIZE + SPACING);
    mesh.position.add(new THREE.Vector3(KEY_SIZE/2, KEY_SIZE/2, 0)); // So the origin is the lower left
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
Object.keys(SCALES).forEach(function(scale, index) {
  var pickerKey = new THREE.Mesh(keyGeom, new THREE.MeshBasicMaterial({color: SCALES[scale].color}));
  scaleChooser.add(pickerKey);
  pickerKey.position.set(index * (KEY_SIZE + SPACING), 0, 0);
  pickerKey.position.x -= 2.5 * (KEY_SIZE + SPACING); // Center it
  pickerKey.scaleName = scale;
});
scaleChooser.position.x = window.innerWidth/2;
scene.add(scaleChooser);

// SYNTH
// create a synth and connect it to the master output (your speakers)
var synth = new Tone.PolySynth(16, Tone.Synth).toMaster();

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
      currentScale = SCALES[clickedScale.object.scaleName];
      var currentColor = SCALES[clickedScale.object.scaleName].color;
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

var TEMPO = 120;
var STEP_VALUE = 1/8;
var previousPosition = 0;
var triggerNotes = false;
var swing = 0.0;
function update() {
  var beats = performance.now() / 1000 / 60 * TEMPO;
  var position = beats * (1/4 / STEP_VALUE);
  if (Math.floor(position) % 2 === 1) {
    position += swing;
  }
  position = Math.floor(position % NUM_STEPS);

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
        var note = currentNotes[(keyMesh.note) % currentNotes.length];
        var octave = Math.floor(keyMesh.note / currentNotes.length) + 3;
        octave += currentScale.octaves[(keyMesh.note) % currentNotes.length];
        // if (note === "B") { // TODO HAAAAX
        //   octave -= 1;
        // }
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

// var container = document.getElementById("container");
// var renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);
// container.appendChild(renderer.domElement);
