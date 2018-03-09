import * as THREE from "../node_modules/three";
import Materials from "./Materials";
import {Constants} from "./AppData";

function IndicatorLight(options) {
  options = options || {};
  var radius = options.radius || 1;
  var g = new THREE.PlaneBufferGeometry(2 * radius, 2 * radius);
  THREE.Mesh.call(this, g, Materials.indicatorLight());

  this.angle = options.angle || 0;
}
IndicatorLight.prototype = Object.create(THREE.Mesh.prototype);

function Knob(options) {
  THREE.Group.call(this);
  const SENSITIVITY = 1; // How many degrees the knob turns per pixel
  const NUM_CIRCLE_SEGMENTS = 100; // How smooth is the circle
  const INDICATOR_LIGHT_DISTANCE_RATIO = 1.25; // distance of indicator lights relative to radius
  const INDICATOR_LIGHT_SIZE_RATIO = 0.2; // radius of lights relative to knob radius

  options = options || {};
  var minRotation = options.minRotation || -0.75 * Math.PI;
  var maxRotation = options.maxRotation || 0.75 * Math.PI;
  var minValue = options.minValue || 0;
  var maxValue = options.maxValue || 100;
  var currentValue = options.currentValue || minValue;
  var numLights = options.numLights || 16;
  var size = options.size || 145;

  var isActive = false;
  var touchStartRotation = 0;
  var touchStartPos = new THREE.Vector2();

  // Textures.createTexture("sword_icon.png", "../textures/sword_icon.png");
  // var tex = Textures.get("sword_icon.png");
  var radius = size / (INDICATOR_LIGHT_DISTANCE_RATIO + INDICATOR_LIGHT_SIZE_RATIO);
  var bodyGeom = new THREE.CircleBufferGeometry(radius, NUM_CIRCLE_SEGMENTS);
  var bodyMat = new THREE.MeshBasicMaterial({color: Constants.BASE_COLOR});
  // var bodyMat = new THREE.MeshBasicMaterial({color: 0x000000});
  var body = new THREE.Mesh(bodyGeom, bodyMat);
  this.add(body);
  // body.visible = false;

  var nib = new THREE.Mesh(bodyGeom, new THREE.MeshBasicMaterial({color: Constants.SECONDARY_BASE_COLOR}));
  nib.scale.multiplyScalar(0.1);
  body.add(nib);
  nib.position.y += radius * 0.8;

  var lights = (function makeLights() {
    var group = new THREE.Group();
    for (let i = 0; i < numLights; i++) {
      var ic = new IndicatorLight({radius: INDICATOR_LIGHT_SIZE_RATIO * radius});
      var rot = THREE.Math.mapLinear(i, 0, numLights - 1, minRotation, maxRotation);
      // Our rotations start pointing up and have positive values going clockwise
      // Yes, this is absurd, stop waving your arms
      rot = -rot + Math.PI/2;
      var x = INDICATOR_LIGHT_DISTANCE_RATIO * radius * Math.cos(rot);
      var y = INDICATOR_LIGHT_DISTANCE_RATIO * radius * Math.sin(rot);
      ic.angle = rot;
      ic.position.set(x, y, 0);
      group.add(ic);
    }
    return group;
  })();
  this.add(lights);
  // this.lights = lights.children;

  function setRotation(rotation) {
    // This is necessary because values are counter clockwise
    body.rotation.z = -rotation;
    lights.children.forEach(function(light) {
      // Same regrettable tranformation as above
      var lightRot = -rotation + Math.PI/2;
      if (light.angle >= lightRot) {
        light.material.uniforms.u_isOn.value = 1;
      } else {
        light.material.uniforms.u_isOn.value = 0;
      }
      var brightness = THREE.Math.smoothstep(light.angle, lightRot - 0.5, lightRot); // light is smeared out by 0.5 radians
      brightness = THREE.Math.mapLinear(brightness, 0.0, 1.0, 0.05, 0.3); // [min brightness, max brightness] = [0.05, 0.3]
      light.material.uniforms.u_brightness.value = brightness;
    });
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

  this.touch = function(mouse) {
    if (isActive) {
      var touchDiff = mouse.y - touchStartPos.y;
      var newRotation = touchStartRotation + THREE.Math.degToRad(SENSITIVITY * touchDiff);
      newRotation = THREE.Math.clamp(newRotation, minRotation, maxRotation);
      setRotation(newRotation);
      currentValue = getValueFromRotation(newRotation);
    }
  };
}
Knob.prototype = Object.create(THREE.Object3D.prototype);

export default Knob;
