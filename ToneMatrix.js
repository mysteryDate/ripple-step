import * as THREE from "./node_modules/three";
import {Constants} from "./AppData";

function makeKeyShader() {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_baseColor: {value: new THREE.Color(Constants.BASE_COLOR)},
      u_activeColor: {value: new THREE.Color()},
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

function MatrixButton(row, column, geometry) {
  THREE.Mesh.call(this, geometry, makeKeyShader());
  this.row = row;
  this.column = column;
}
MatrixButton.prototype = Object.create(THREE.Mesh.prototype);

function ToneMatrix(width, height) {
  THREE.Group.call(this);
  var keyGeometry = new THREE.PlaneBufferGeometry(1/width, 1/height); // TODO Padding
  var buttons = [];
  for (var i = 0; i < width; i++) {
    buttons.push([]);
    for (var j = 0; j < height; j++) {
      var button = new MatrixButton(i, j, keyGeometry);
      button.position.set(i, j, 0).multiplyScalar(1/width, 1/height, 1);
      buttons[i].push(button);
      this.add(button);
    }
  }

  this.buttons = buttons;
}
ToneMatrix.prototype = Object.create(THREE.Object3D.prototype);

export default ToneMatrix;
