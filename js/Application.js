import * as THREE from "../node_modules/three";
import {sample, random} from "../node_modules/underscore";

import {Constants, Scales, Controls} from "./AppData";
import ToneMatrix from "./ToneMatrix";
// import Rippleizer from "./Rippleizer";
import ScaleChooser from "./ScaleChooser";
import RippleSynth from "./RippleSynth";
import ControlPanel from "./ControlPanel";
import Transport from "./Transport";

function makeToneMatrix(width, height, numSteps, numNotes) {
  var toneMatrix = new ToneMatrix(numSteps, numNotes);
  toneMatrix.scale.set(width, height, 1);
  // toneMatrix.shadowGroup.scale.set(width, height, 1);
  toneMatrix.position.set(width/2, height/2, 1);
  toneMatrix.armButton(0, random(0, numNotes - 1)); // Arm random button

  return toneMatrix;
}

function Application(selector, width, height, options) {
  var canvas = document.querySelector(selector);
  var downsample = (options.isMobile === true) ? 4 : 1;
  // this.inputHandler = new InputHandler(this.canvas);
  var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio/downsample);
  renderer.setSize(width, height);
  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera();
  camera.position.set(width/2, height/2, 50);

  var currentScale = sample(Object.values(Scales));
  var toneMatrixSize = Math.min(width, height) * 0.8;
  var toneMatrix = makeToneMatrix(toneMatrixSize, toneMatrixSize, options.numSteps, options.numNotes);
  // var rippleizer = new Rippleizer(renderer, toneMatrix.shadowGroup);
  scene.add(toneMatrix);

  var scaleChooser = new ScaleChooser(Scales);
  scaleChooser.position.x = width/2;
  scaleChooser.scale.set(toneMatrixSize/Constants.NUM_STEPS, toneMatrixSize/Constants.NUM_STEPS, 1);
  scene.add(scaleChooser);

  // SYNTH
  var synth = new RippleSynth(Constants.NUM_STEPS, {});
  synth.setVolume(-6);

  // Controls for the envelope
  var knobPanel = new ControlPanel({
    knobs: Controls.Knobs,
    getter: synth.getControl,
    setter: synth.setControl,
  });
  scene.add(knobPanel);
  // knobPanel.visible = false; //  TODO

  var transport = new Transport();
  var raycaster = new THREE.Raycaster();

  var paused = false;
  var muted = false;
  var startTime = null;

  Object.assign(this, {
    scaleChooser: scaleChooser,
    currentScale: currentScale,
    // rippleizer: rippleizer,
    toneMatrix: toneMatrix,
    downsample: downsample,
    raycaster: raycaster,
    transport: transport,
    startTime: startTime,
    knobPanel: knobPanel,
    renderer: renderer,
    camera: camera,
    paused: paused,
    height: height,
    muted: muted,
    scene: scene,
    synth: synth,
    width: width,
  });
}

Application.prototype.render = function() {
  // this.rippleizer.render();
  // this.toneMatrix.setRippleTexture(this.rippleizer.getActiveTexture());
  this.renderer.render(this.scene, this.camera);
};

Application.prototype.setScale = function(newScale) {
  this.currentScale = newScale; // TODO does this need to be stored?
  this.toneMatrix.setActiveColor({
    buttonColor: new THREE.Color(this.currentScale.color),
    shadowColor: new THREE.Color(this.currentScale.ripple_color),
  });
  this.synth.scale = this.currentScale;
  this.knobPanel.setColor(new THREE.Color(this.currentScale.color));
};

Application.prototype.resize = function(width, height) {
  this.renderer.setSize(width, height);
  this.renderer.setPixelRatio(window.devicePixelRatio/this.downsample);
  this.camera.left = -width/2;
  this.camera.right = width/2;
  this.camera.top = height/2;
  this.camera.bottom = -height/2;
  this.camera.position.set(width/2, height/2, 50);
  this.camera.updateProjectionMatrix();

  var toneMatrixSize = Math.min(width, height);
  this.toneMatrix.scale.set(toneMatrixSize, toneMatrixSize, 1);
  this.toneMatrix.position.set(width/2, height/2, 1);
  // this.toneMatrix.shadowGroup.scale.set(toneMatrixSize, toneMatrixSize, 1);
  // this.rippleizer = new Rippleizer(this.renderer, this.toneMatrix.shadowGroup);

  var controlPanelLayout = (width > height) ? "vertical" : "horizontal";
  var availableSpace = height - (height/2 + toneMatrixSize/2);
  var controlPanelHeight = availableSpace * 0.7;
  var controlPanelWidth = width;
  if (controlPanelLayout === "vertical") {
    availableSpace = width - (width/2 + toneMatrixSize/2);
    controlPanelWidth = availableSpace * 0.7;
    controlPanelHeight = height;
  }

  this.knobPanel.resize(controlPanelWidth, controlPanelHeight);
  if (controlPanelLayout === "vertical") { // On the right side
    this.knobPanel.position.x = (3 * width + toneMatrixSize) / 4;
    this.knobPanel.position.y = height/2;
  } else { // On the top
    this.knobPanel.position.x = width/2;
    this.knobPanel.position.y = (3 * height + toneMatrixSize) / 4;
  }

  this.scaleChooser.position.set(0, 0, 0);
  this.scaleChooser.rotation.set(0, 0, 0);
  if (controlPanelLayout === "vertical") {
    this.scaleChooser.position.x = (width - toneMatrixSize) / 4;
    this.scaleChooser.position.y = height/2;
    this.scaleChooser.rotateZ(Math.PI /2);
  } else {
    this.scaleChooser.position.x = width/2;
    this.scaleChooser.position.y = (height - toneMatrixSize) / 4;
  }
  this.scaleChooser.scale.set(toneMatrixSize/Constants.NUM_STEPS, toneMatrixSize/Constants.NUM_STEPS, 1);

  this.width = width;
  this.height = height;
};

// TODO store interactables in array
Application.prototype.touchStart = function(event) {
  var mouse = new THREE.Vector2();
  mouse.x = (event.pageX / this.width) * 2 - 1;
  mouse.y = -(event.pageY / this.height) * 2 + 1;
  this.raycaster.setFromCamera(mouse, this.camera);
  this.toneMatrix.touchStart(this.raycaster);
  this.scaleChooser.touchStart(this.raycaster);
  if (this.knobPanel.visible) {
    this.knobPanel.touchStart(this.raycaster, event);
  } // TODO is a mousemove now necessary?
};

Application.prototype.touch = function(event) {
  var mouse = new THREE.Vector2();
  mouse.x = (event.pageX / this.width) * 2 - 1;
  mouse.y = -(event.pageY / this.height) * 2 + 1;
  this.raycaster.setFromCamera(mouse, this.camera);
  this.toneMatrix.touch(this.raycaster);
  if (this.knobPanel.visible) {
    this.knobPanel.touch(this.raycaster, event);
  }
};

Application.prototype.touchEnd = function() {
  if (this.knobPanel.visible) {
    this.knobPanel.touchEnd();
  }
  this.toneMatrix.touchEnd();
};

Application.prototype.clear = function() {
  this.toneMatrix.clear();
};

Application.prototype.toggleMute = function() {
  this.muted = !this.muted;
  this.toneMatrix.mute(this.muted);
  this.knobPanel.setColor(new THREE.Color(this.currentScale.color).multiplyScalar(
    THREE.Math.lerp(1.0, Constants.MUTE_COLOR_VALUE, this.muted)
  )); // TODO set damping
};

Application.prototype.togglePaused = function() {
  this.transport.togglePaused();
};

Application.prototype.start = function() {
  this.transport.start();
};

Application.prototype.update = function() {
  this.transport.update();


  // TODO, this is hideous
  // this.rippleizer.damping.value = (function getRelease() {
  //   var release = window.app.synth.getControl("release");
  //   var minRelease = Controls.Envelope.release.minValue;
  //   var maxRelease = Controls.Envelope.release.maxValue;
  //   var dampingValue;
  //   var firstStop = 0.05;
  //   if (release < THREE.Math.lerp(minRelease, maxRelease, firstStop)) {
  //     dampingValue = THREE.Math.mapLinear(release, minRelease, THREE.Math.lerp(minRelease, maxRelease, firstStop), 0.9, 0.995);
  //   } else if (release === Controls.Envelope.release.maxValue) {
  //     dampingValue = 1;
  //   } else {
  //     dampingValue = THREE.Math.mapLinear(release, THREE.Math.lerp(minRelease, maxRelease, firstStop), maxRelease, 0.995, 0.999);
  //   }
  //   return dampingValue;
  // })();
};

export default Application;
