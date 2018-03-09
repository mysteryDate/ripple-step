import * as THREE from "../node_modules/three";
import Materials from "./Materials";

function IndicatorLight(options) {
  var g = new THREE.PlaneBufferGeometry(40, 40); // TODO
  THREE.Mesh.call(this, g, Materials.indicatorLight());

  options = options || {};
  this.angle = options.angle || 0;
}
IndicatorLight.prototype = Object.create(THREE.Mesh.prototype);

function Knob(options) {
  THREE.Group.call(this);
  var SENSITIVITY = 1; // How many degrees the knob turns per pixel
  options = options || {};
  var minRotation = options.minRotation || 0;
  var maxRotation = options.maxRotation || 2 * Math.PI;
  var minValue = options.minValue || 0;
  var maxValue = options.maxValue || 100;
  var currentValue = options.currentValue || minValue;
  var numLights = options.numLights || 16;

  var isActive = false;
  var touchStartRotation = 0;
  var touchStartPos = new THREE.Vector2();

  // RS.Textures.createTexture("sword_icon.png", "../textures/sword_icon.png");
  // var tex = RS.Textures.get("sword_icon.png");
  var radius = 100;
  var bodyGeom = new THREE.CircleBufferGeometry(radius, 100);
  // var bodyMat = new THREE.MeshBasicMaterial({color: RS.Constants.BASE_COLOR});
  var bodyMat = new THREE.MeshBasicMaterial({color: 0x000000});
  var body = new THREE.Mesh(bodyGeom, bodyMat);
  this.add(body);
  // body.visible = false;

  var nib = new THREE.Mesh(bodyGeom, new THREE.MeshBasicMaterial({color: "white"}));
  nib.scale.multiplyScalar(0.1);
  // body.add(nib);
  nib.position.y += radius * 0.8;

  var lights = (function makeLights() {
    var group = new THREE.Group();
    for (let i = 0; i < numLights; i++) {
      var ic = new IndicatorLight();
      var rot = THREE.Math.mapLinear(i, 0, numLights - 1, minRotation, maxRotation);
      // Our rotations start pointing up and have positive values going clockwise
      // Yes, this is absurdly incompatible, stop waving your arms
      rot = -rot + Math.PI/2;
      var x = 1.2 * radius * Math.cos(rot);
      var y = 1.2 * radius * Math.sin(rot);
      ic.angle = rot;
      ic.position.set(x, y, 0);
      ic.material.color = new THREE.Color(1, THREE.Math.mapLinear(i, 0, numLights - 1, 0, 1), 1);
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
      var bv = THREE.Math.smoothstep(light.angle, lightRot - 0.5, lightRot, 1.0, 0.0);
      bv = THREE.Math.mapLinear(bv, 0.0, 1.0, 0.05, 0.3);
      light.material.uniforms.u_brightness.value = bv;
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
