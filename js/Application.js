import * as THREE from "../node_modules/three";
import {sample, random} from "../node_modules/underscore";

import {Constants, Scales, Controls} from "./AppData";
import ToneMatrix from "./ToneMatrix";
import Rippleizer from "./Rippleizer";
import ScaleChooser from "./ScaleChooser";
import RippleSynth from "./RippleSynth";
import ControlPanel from "./ControlPanel";

function makeToneMatrix(width, height, numSteps, numNotes) {
  var toneMatrix = new ToneMatrix(numSteps, numNotes);
  toneMatrix.scale.set(width, height, 1);
  toneMatrix.shadowGroup.scale.set(width, height, 1);
  toneMatrix.position.set(width/2, height/2, 1);
  toneMatrix.armButton(0, random(0, numNotes - 1)); // Arm random button

  return toneMatrix;
}

function Application(selector, width, height, options) {
  var canvas = document.querySelector(selector);
  // this.inputHandler = new InputHandler(this.canvas);
  var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 100);
  camera.position.set(width/2, height/2, 50);

  var currentScale = sample(Object.values(Scales));
  var toneMatrixSize = Math.min(width, height) * 0.8;
  var toneMatrix = makeToneMatrix(toneMatrixSize, toneMatrixSize, options.numSteps, options.numNotes);
  var rippleizer = new Rippleizer(renderer, toneMatrix.shadowGroup);
  scene.add(toneMatrix);

  var scaleChooser = new ScaleChooser(Scales);
  scaleChooser.position.x = width/2;
  scaleChooser.scale.set(toneMatrixSize/Constants.NUM_STEPS, toneMatrixSize/Constants.NUM_STEPS, 1);
  scene.add(scaleChooser);

  // SYNTH
  var synth = new RippleSynth(Constants.NUM_STEPS);
  synth.setVolume(-6);

  // Controls for the envelope
  var knobPanel = new ControlPanel({
    knobs: Controls.Knobs,
    getter: synth.getControl,
    setter: synth.setControl,
  });
  scene.add(knobPanel);
  knobPanel.visible = false;

  var raycaster = new THREE.Raycaster();

  var paused = false;
  var muted = false;

  Object.assign(this, {
    scaleChooser: scaleChooser,
    currentScale: currentScale,
    rippleizer: rippleizer,
    toneMatrix: toneMatrix,
    raycaster: raycaster,
    knobPanel: knobPanel,
    renderer: renderer,
    height: height,
    paused: paused,
    muted: muted,
    width: width,
    scene: scene,
    synth: synth,
  });
}

Application.prototype.setScale = function(newScale) {
  this.currentScale = newScale;
  this.toneMatrix.setActiveColor({
    buttonColor: new THREE.Color(this.currentScale.color),
    shadowColor: new THREE.Color(this.currentScale.ripple_color),
  });
  this.knobPanel.setColor(new THREE.Color(this.currentScale.color));
};

Application.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
  this.renderer.setSize(this.width, this.height);
  this.camera = new THREE.OrthographicCamera(-this.width/2, this.width/2, this.height/2, -this.height/2, 0.1, 100);
  this.camera.position.set(this.width/2, this.height/2, 50);

  var toneMatrixSize = Math.min(this.width, this.height) * 0.8;
  this.toneMatrix.scale.set(toneMatrixSize, toneMatrixSize, 1);
  this.toneMatrix.position.set(this.width/2, this.height/2, 1);
  this.toneMatrix.shadowGroup.scale.set(toneMatrixSize, toneMatrixSize, 1);
  this.rippleizer = new Rippleizer(this.renderer, this.toneMatrix.shadowGroup);

  this.scaleChooser.position.x = this.width/2;
  this.scaleChooser.scale.set(toneMatrixSize/Constants.NUM_STEPS, toneMatrixSize/Constants.NUM_STEPS, 1);

  var controlPanelLayout = (this.width > this.height) ? "vertical" : "horizontal";
  var availableSpace = this.height - (this.height/2 + toneMatrixSize/2);
  var controlPanelHeight = availableSpace * 0.7;
  var controlPanelWidth = this.width;
  if (controlPanelLayout === "vertical") {
    availableSpace = this.width - (this.width/2 + toneMatrixSize/2);
    controlPanelWidth = availableSpace * 0.7;
    controlPanelHeight = this.height;
  }

  this.knobPanel.resize(controlPanelWidth, controlPanelHeight);
  if (controlPanelLayout === "vertical") { // On the right side
    this.knobPanel.position.x = (3 * this.width + toneMatrixSize) / 4;
    this.knobPanel.position.y = this.height/2;
  } else { // On the top
    this.knobPanel.position.x = this.width/2;
    this.knobPanel.position.y = (3 * this.height + toneMatrixSize) / 4;
  }
};

// TODO store interactables in array
Application.prototype.touchStart = function(mouse) {
  this.raycaster.setFromCamera(mouse, this.camera);
  this.toneMatrix.touchStart(this.raycaster);
  this.scaleChooser.touchStart(this.raycaster);
  if (this.knobPanel.visible) {
    this.knobPanel.touchStart(this.raycaster, event);
  } // TODO is a mousemove now necessary?
};

Application.prototype.touch = function(mouse) {
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

export default Application;
