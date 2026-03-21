import {
  WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry,
  MeshBasicMaterial, Mesh, Color, Raycaster, Vector2, MathUtils,
  ColorManagement, LinearSRGBColorSpace
} from "three";

import {Constants, Scales, Settings, Controls} from "./AppData";
import ToneMatrix from "./ToneMatrix";
import ScaleChooser from "./ScaleChooser";
import RippleSynth from "./RippleSynth";
import ControlPanel from "./ControlPanel";
import Transport from "./Transport";

var _mouse = new Vector2();

function Application(selector, width, height, options) {
  var canvas = document.querySelector(selector);
  var downsample = (options.isMobile === true) ? Settings.MOBILE_DOWNSAMPLE : Settings.DESKTOP_DOWNSAMPLE;
  ColorManagement.enabled = false;
  var renderer = new WebGLRenderer({canvas: canvas, antialias: true});
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setPixelRatio(window.devicePixelRatio/downsample);
  var scene = new Scene();
  var camera = new OrthographicCamera();

  var bgGeometry = new PlaneGeometry(1, 1);
  var bgMaterial = new MeshBasicMaterial({color: Constants.BACKGROUND_COLOR});
  var bgPlane = new Mesh(bgGeometry, bgMaterial);
  bgPlane.position.z = -10;
  scene.add(bgPlane);

  var scaleKeys = Object.keys(Scales);
  var currentScaleName = scaleKeys[Math.floor(Math.random() * scaleKeys.length)];
  var currentScale = Scales[currentScaleName];
  var toneMatrix = new ToneMatrix(options.numSteps, options.numNotes);
  scene.add(toneMatrix);

  var scaleChooser = new ScaleChooser(Scales, currentScaleName);
  scene.add(scaleChooser);

  // One transport per scale, each with its own tempo multiplier
  var transports = {};
  Object.keys(Scales).forEach(function(scaleName) {
    transports[scaleName] = new Transport({
      tempoMultiplier: Scales[scaleName].tempo_multiplier,
    });
  });

  var transportNames = Object.keys(Scales);
  var raycaster = new Raycaster();

  var paused = false;
  var muted = false;
  var startTime = null;
  var currentTime = null;

  Object.assign(this, {
    scaleChooser: scaleChooser,
    currentScaleName: currentScaleName,
    currentScale: currentScale,
    currentTime: currentTime,
    toneMatrix: toneMatrix,
    downsample: downsample,
    numNotes: options.numNotes,
    raycaster: raycaster,
    transportNames: transportNames,
    transports: transports,
    startTime: startTime,
    renderer: renderer,
    camera: camera,
    paused: paused,
    height: height,
    muted: muted,
    scene: scene,
    width: width,
    bgPlane: bgPlane,
    audioContext: options.audioContext,
  });
}

Application.prototype.init = function() {
  // SYNTH
  var synth = new RippleSynth(Constants.NUM_NOTES, {audioContext: this.audioContext});
  synth.setVolume(-6);

  // Controls for the envelope
  var knobPanel = new ControlPanel({
    knobs: Controls.Knobs,
    getter: synth.getControl,
    setter: synth.setControl,
  });
  this.scene.add(knobPanel);
  this.synth = synth;
  this.knobPanel = knobPanel;

  // Arm the initial note in a random scale color, then switch to a different scale
  var scaleKeys = Object.keys(Scales);
  var noteScaleIndex = Math.floor(Math.random() * scaleKeys.length);
  var noteScale = Scales[scaleKeys[noteScaleIndex]];
  this.setScale(noteScale);

  var minRow = Math.floor(this.numNotes / 4);
  var maxRow = Math.floor(this.numNotes * 0.75);
  this.initialColumn = 8;
  this.toneMatrix.armButton(this.initialColumn, Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow);

  // Switch to a different scale for the chooser/UI
  var uiScaleIndex = (noteScaleIndex + 1 + Math.floor(Math.random() * (scaleKeys.length - 1))) % scaleKeys.length;
  this.setScale(Scales[scaleKeys[uiScaleIndex]]);
  this.scaleChooser.selectScale(scaleKeys[uiScaleIndex]);

  this.resize(this.width, this.height);
};

Application.prototype.render = function() {
  this.toneMatrix.render(this.renderer);
  this.renderer.render(this.scene, this.camera);
};

Application.prototype.setScale = function(newScale) {
  this.currentScale = newScale;
  var self = this;
  Object.keys(Scales).forEach(function(name) {
    if (Scales[name] === newScale) {
      self.currentScaleName = name;
    }
  });
  this.toneMatrix.setCurrentScale(
    new Color(this.currentScale.color),
    new Color(this.currentScale.ripple_color),
    this.currentScale
  );
  this.synth.scale = this.currentScale;
  this.knobPanel.setColor(new Color(this.currentScale.color));
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

  this.bgPlane.scale.set(width, height, 1);
  this.bgPlane.position.set(width/2, height/2, -10);

  var toneMatrixSize = Math.min(width, height);
  var aspectRatio = width/height;
  if (aspectRatio > 1 - Constants.MIN_UI_PADDING && aspectRatio < 1/(1 - Constants.MIN_UI_PADDING)) {
    if (aspectRatio > 1) {
      toneMatrixSize = (1 - Constants.MIN_UI_PADDING) * width;
    } else {
      toneMatrixSize = (1 - Constants.MIN_UI_PADDING) * height;
    }
  }
  this.toneMatrix.scale.set(toneMatrixSize, toneMatrixSize, 1);
  this.toneMatrix.position.set(width/2, height/2, 1);

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
  var numScales = Object.keys(Scales).length;
  var scaleChooserSize = 0.5;
  if (controlPanelLayout === "vertical") {
    this.scaleChooser.position.x = (width - toneMatrixSize) / 4;
    this.scaleChooser.position.y = height/2;
    this.scaleChooser.rotateZ(Math.PI /2);
    scaleChooserSize *= height/numScales;
  } else {
    this.scaleChooser.position.x = width/2;
    this.scaleChooser.position.y = (height - toneMatrixSize) / 4;
    scaleChooserSize *= width/numScales;
  }
  this.scaleChooser.scale.set(scaleChooserSize, scaleChooserSize, 1);
  this.scaleChooser.setVertical(controlPanelLayout === "vertical");

  this.width = width;
  this.height = height;
};

// TODO store interactables in array
Application.prototype.touchStart = function(event) {
  _mouse.x = (event.pageX / this.width) * 2 - 1;
  _mouse.y = -(event.pageY / this.height) * 2 + 1;
  this.raycaster.setFromCamera(_mouse, this.camera);
  this.toneMatrix.touchStart(this.raycaster);
  this.scaleChooser.touchStart(this.raycaster);
  this.knobPanel.touchStart(this.raycaster, event);
};

Application.prototype.touch = function(event) {
  _mouse.x = (event.pageX / this.width) * 2 - 1;
  _mouse.y = -(event.pageY / this.height) * 2 + 1;
  this.raycaster.setFromCamera(_mouse, this.camera);
  this.toneMatrix.touch(this.raycaster);
  this.knobPanel.touch(this.raycaster, event);
  this.scaleChooser.touch(this.raycaster);
};

Application.prototype.touchEnd = function() {
  this.knobPanel.touchEnd();
  this.toneMatrix.touchEnd();
};

Application.prototype.clear = function() {
  this.toneMatrix.clear();
};

Application.prototype.toggleMute = function() {
  this.muted = !this.muted;
  this.toneMatrix.mute(this.muted);
  this.knobPanel.setColor(new Color(this.currentScale.color).multiplyScalar(
    MathUtils.lerp(1.0, Constants.MUTE_COLOR_VALUE, this.muted)
  )); // TODO set damping
};

Application.prototype.togglePaused = function() {
  var self = this;
  this.transportNames.forEach(function(name) {
    self.transports[name].togglePaused();
  });
  if (this.paused) {
    this.toneMatrix.deactivateColumns();
  }
};


Application.prototype.start = function() {
  this.synth.start();
  var self = this;
  this.transportNames.forEach(function(name) {
    self.transports[name].start(self.initialColumn);
  });
};

Application.prototype.update = function() {
  this.currentTime = performance.now();
  var self = this;

  // Tick each scale's transport independently
  this.transportNames.forEach(function(scaleName) {
    var transport = self.transports[scaleName];
    transport.update(function() {
      if (!self.muted && !window.app.muted && self.scaleChooser.isScaleAudible(scaleName)) {
        var notes = self.toneMatrix.getActiveNotesInColumn(transport.position);
        notes.forEach(function(note) {
          if (note.scale === Scales[scaleName]) {
            window.app.synth.playRow(note.row, note.scale);
          }
        });
      }
    });
  });

  // Set per-button active state based on each scale's transport position
  var scaleColumnMap = new Map();
  this.transportNames.forEach(function(scaleName) {
    if (self.scaleChooser.isScaleAudible(scaleName)) {
      scaleColumnMap.set(Scales[scaleName], self.transports[scaleName].position);
    }
  });
  this.toneMatrix.activateByScale(scaleColumnMap);

  // Dim buttons belonging to inaudible scales
  var mutedScales = new Set();
  this.transportNames.forEach(function(scaleName) {
    if (!self.scaleChooser.isScaleAudible(scaleName)) {
      mutedScales.add(Scales[scaleName]);
    }
  });
  this.toneMatrix.setMutedScales(mutedScales);

  this.scaleChooser.update(this.currentTime);

  // TODO have more robust control infrastructure
  var swingValue = this.synth.getControl("swing");
  this.transportNames.forEach(function(name) {
    self.transports[name].swing = swingValue;
  });

  // TODO, this is hideous
  var newDamping = (function getRelease() {
    var release = window.app.synth.getControl("release");
    var minRelease = Controls.Envelope.release.minValue;
    var maxRelease = Controls.Envelope.release.maxValue;
    // var dampingValue;
    // var firstStop = 0.05;
    // const maxDamping = 0.95;
    // if (release < MathUtils.lerp(minRelease, maxRelease, firstStop)) {
    //   dampingValue = MathUtils.mapLinear(release, minRelease, MathUtils.lerp(minRelease, maxRelease, firstStop), 0.9, maxDamping);
    // } else if (release === Controls.Envelope.release.maxValue) {
    //   dampingValue = maxDamping;
    // } else {
    //   dampingValue = MathUtils.mapLinear(release, MathUtils.lerp(minRelease, maxRelease, firstStop), maxRelease, 0.995, maxDamping);
    // }
    return MathUtils.mapLinear(release, minRelease, maxRelease, 0.9, 0.995);
    // return dampingValue;
  })();
  this.toneMatrix.setDamping(newDamping);
};

export default Application;
