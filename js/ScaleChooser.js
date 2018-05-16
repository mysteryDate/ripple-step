import * as THREE from "../node_modules/three";
import {Constants} from "./AppData";

function makeChooserMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_color: {value: new THREE.Color(color)},
      u_baseColor: {value: new THREE.Color(Constants.BASE_COLOR)},
      u_mouseOver: {value: false},
      u_selected: {value: false},
    },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 u_color;
      uniform vec3 u_baseColor;
      uniform float u_mouseOver;
      uniform float u_selected;
      void main() {
        vec3 color = mix(u_baseColor, u_color * 0.5, u_mouseOver);
        color = mix(color, u_color, u_selected);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

function ScaleChooser(scales, currentScale) {
  THREE.Group.call(this);
  Object.keys(scales).forEach(function(scale, index) {
    var pickerKey = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1),
      makeChooserMaterial(scales[scale].color)
    );
    this.add(pickerKey);
    pickerKey.position.set(index * ((1 + Constants.SPACING_RATIO)), 0, 0);
    pickerKey.position.x -= (Object.keys(scales).length/2 - 0.5) * (1 + Constants.SPACING_RATIO); // Center it
    pickerKey.scaleName = scale;
    if (scale === currentScale) {
      pickerKey.material.uniforms.u_selected.value = true;
    }
  }.bind(this));
  this.scales = scales;
  this.currentScale = null;
}
ScaleChooser.prototype = Object.create(THREE.Object3D.prototype);

ScaleChooser.prototype.touchStart = function(raycaster) {
  var clickedScale = raycaster.intersectObjects(this.children)[0];
  if (clickedScale !== undefined) {
    this.children.forEach(function(key) {
      key.material.uniforms.u_selected.value = false;
    });
    clickedScale.object.material.uniforms.u_selected.value = true;
    window.app.setScale(this.scales[clickedScale.object.scaleName]); // TODO, demeter
  }
};
ScaleChooser.prototype.touch = function(raycaster) {
  this.children.forEach(function(key) {
    key.material.uniforms.u_mouseOver.value = false;
  });
  var touched = raycaster.intersectObjects(this.children)[0];
  if (touched !== undefined) {
    touched.object.material.uniforms.u_mouseOver.value = true;
  }
};

export default ScaleChooser;
