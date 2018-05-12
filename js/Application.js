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
  var paused = false;
  var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 100);
  camera.position.set(width/2, height/2, 50);

  var currentScale = sample(Object.values(Scales));
  var toneMatrixSize = Math.min(width, height) * 0.8;
  var toneMatrix = makeToneMatrix(toneMatrixSize, toneMatrixSize, options.numSteps, options.numNotes);
  scene.add(toneMatrix);

  var rippleizer = new Rippleizer(renderer, toneMatrix.shadowGroup);
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

  Object.assign(this, {
    scaleChooser: scaleChooser,
    currentScale: currentScale,
    rippleizer: rippleizer,
    toneMatrix: toneMatrix,
    knobPanel: knobPanel,
    renderer: renderer,
    paused: paused,
    height: height,
    width: width,
    scene: scene,
    synth: synth,
  });
}

export default Application;
