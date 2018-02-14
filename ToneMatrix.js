import * as THREE from "./node_modules/three";
import {Constants} from "./AppData";

function makeKeyShader() {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_baseColor: {value: new THREE.Color(Constants.BASE_COLOR)},
      u_activeColor: {value: new THREE.Color()},
      u_armed: {value: 0},
      u_columnActive: {value: 0},
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
      uniform float u_columnActive;
      void main() {
        vec3 col = mix(u_baseColor, u_activeColor, u_armed);
        col = mix(col, 2.0 * col, u_columnActive * u_armed);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function MatrixButton(row, column, geometry) {
  THREE.Mesh.call(this, geometry, makeKeyShader());
  this.row = row;
  this.column = column;

  var armed = false;

  this.arm = function() {
    armed = true;
    this.material.uniforms.u_active.value = true;
  };
  this.disarm = function() {
    armed = false;
    this.material.uniforms.u_active.value = false;
  };
  this.isArmed = function() {
    return armed;
  };
}
MatrixButton.prototype = Object.create(THREE.Mesh.prototype);

function ToneMatrix(width, height) {
  THREE.Group.call(this);
  var keyGeometry = (function makeKeyGeometry() {
    var w = width + (width - 1) * Constants.SPACING_RATIO;
    var h = height + (height - 1) * Constants.SPACING_RATIO;
    return new THREE.PlaneBufferGeometry(1/w, 1/h);
  })();
  var buttons = [];
  var columns = [];
  for (var col = 0; col < width; col++) {
    columns.push([]);
    for (var row = 0; row < height; row++) {
      var button = new MatrixButton(row, col, keyGeometry);
      button.position.set(col - width/2, row - height/2, 0).multiplyScalar(1/width, 1/height, 1);
      buttons.push(button);
      columns[col].push(button);
      this.add(button);
    }
  }

  function setButtonUniform(uniform, value) {
    buttons.forEach(function(btn) {
      btn.material.uniforms[uniform].value = value;
    });
  }

  this.armButton = function(x, y) {
    buttons[x][y].arm();
  };
  this.activateColumn = function(num) {
    setButtonUniform("u_columnActive", false);
    var armedRows = [];
    columns[num].forEach(function(btn) {
      btn.material.uniforms.u_columnActive.value = true;
      // if (btn.isArmed()) { // TODO
      if (btn.material.uniforms.u_armed.value === true) {
        armedRows.push(btn.row);
      }
    });
    return armedRows;
  };

  this.setActiveColor = function(color) {
    setButtonUniform("u_activeColor", color);
  };
}
ToneMatrix.prototype = Object.create(THREE.Object3D.prototype);

export default ToneMatrix;
