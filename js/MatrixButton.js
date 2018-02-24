import * as THREE from "../node_modules/three";
import Tone from "../node_modules/Tone";

import {Constants, Scales, Controls} from "./AppData";

function makeKeyShader() {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_baseColor: {value: new THREE.Color()},
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

function MatrixButton(geometry, row, column) {
  var mesh = new THREE.Mesh(geometry, makeKeyShader());
  mesh.position.copy(position)

}
