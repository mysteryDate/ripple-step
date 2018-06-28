import * as THREE from "../node_modules/three/build/three.min.js";
import Materials from "./Materials";
import {Constants} from "./AppData";

function Knob(options) {
  THREE.Group.call(this);
  const NUM_CIRCLE_SEGMENTS = 100; // How smooth is the circle
  const INDICATOR_LIGHT_DISTANCE_RATIO = 1.25; // distance of indicator lights relative to radius
  const INDICATOR_LIGHT_SIZE_RATIO = 0.2; // radius of lights relative to knob radius

  options = options || {};
  var sensitivity = options.sensitivity || 1; // How many degrees the knob turns per pixel
  var minRotation = options.minRotation || -0.75 * Math.PI;
  var maxRotation = options.maxRotation || 0.75 * Math.PI;
  var minValue = options.minValue || 0;
  var maxValue = options.maxValue || 100;
  var currentValue = options.currentValue || minValue;
  var numLights = options.numLights || 16;
  this.control = options.control;

  var isActive = false;
  var touchStartRotation = 0;
  var touchStartPos = new THREE.Vector2();

  var radius = 1 / (INDICATOR_LIGHT_DISTANCE_RATIO + INDICATOR_LIGHT_SIZE_RATIO);
  var bodyGeom = new THREE.CircleBufferGeometry(radius, NUM_CIRCLE_SEGMENTS);
  var bodyMat = new THREE.MeshBasicMaterial({color: Constants.BASE_COLOR});
  var body = new THREE.Mesh(bodyGeom, bodyMat);
  this.add(body);

  var nib = new THREE.Mesh(bodyGeom, new THREE.MeshBasicMaterial({color: Constants.SECONDARY_BASE_COLOR}));
  nib.scale.multiplyScalar(0.1);
  body.add(nib);
  nib.position.y += radius * 0.8;

  var lights = (function makeLights() {
    var icRadius = INDICATOR_LIGHT_SIZE_RATIO * radius;
    var positions = [0, 2 * icRadius, 0, 2 * icRadius, 2 * icRadius, 0, 0, 0, 0, 2 * icRadius, 0, 0];
    var indices = [0, 2, 1, 2, 3, 1];
    var uvs = [0, 1, 1, 1, 0, 0, 1, 0];
    var geom = new THREE.InstancedBufferGeometry();
    geom.addAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geom.translate(-icRadius, -icRadius, 0);
    geom.setIndex(indices);
    geom.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
    var relativePositions = new THREE.InstancedBufferAttribute(new Float32Array(numLights * 3), 3, 1);
    var angles = new THREE.InstancedBufferAttribute(new Float32Array(numLights), 1, 1);

    for (let i = 0; i < numLights; i++) {
      var rot = THREE.Math.mapLinear(i, 0, numLights - 1, minRotation, maxRotation);
      // Our rotations start pointing up and have positive values going clockwise
      // Yes, this is absurd, stop waving your arms
      rot = -rot + Math.PI/2;
      var x = INDICATOR_LIGHT_DISTANCE_RATIO * radius * Math.cos(rot);
      var y = INDICATOR_LIGHT_DISTANCE_RATIO * radius * Math.sin(rot);
      relativePositions.setXYZ(i, x, y, 0);
      angles.setX(i, rot);
    }
    geom.addAttribute("relativePosition", relativePositions);
    geom.addAttribute("angle", angles);
    var instancedMesh = new THREE.Mesh(geom, Materials.indicatorLight());
    return instancedMesh;
  })();
  this.add(lights);

  function setRotation(rotation) {
    // This is necessary because values are counter clockwise
    body.rotation.z = -rotation;
    // same regrettable transformation as above
    lights.material.uniforms.u_currentRotation.value = -rotation + Math.PI/2;
  }
  function getRotationFromValue(value) {
    return THREE.Math.mapLinear(value, minValue, maxValue, minRotation, maxRotation);
  }
  function getValueFromRotation(rotation) {
    return THREE.Math.mapLinear(rotation, minRotation, maxRotation, minValue, maxValue);
  }

  setRotation(getRotationFromValue(currentValue));

  this.getValue = function() {
    return currentValue;
  };

  this.setValue = function(value) {
    currentValue = value;
    setRotation(getRotationFromValue(currentValue));
  };

  this.touchStart = function(raycaster, mouse) {
    var touch = raycaster.intersectObjects(this.children)[0];
    if (touch) {
      isActive = true;
      touchStartPos = mouse;
      touchStartRotation = -body.rotation.z;
    }
  };

  this.touchEnd = function() {
    isActive = false;
  };

  var touchDiff = new THREE.Vector2();
  this.touch = function(mouse) {
    if (isActive) {
      touchDiff.subVectors(mouse, touchStartPos);
      var touchStrength = touchDiff.x + touchDiff.y;
      var newRotation = touchStartRotation + THREE.Math.degToRad(sensitivity * touchStrength);
      newRotation = THREE.Math.clamp(newRotation, minRotation, maxRotation);
      setRotation(newRotation);
      currentValue = getValueFromRotation(newRotation);
    }
  };

  this.setColor = function(color) {
    lights.material.uniforms.u_color.value = new THREE.Color(color); // TODO come in as a three.color?
  };
}
Knob.prototype = Object.create(THREE.Object3D.prototype);

export default Knob;
