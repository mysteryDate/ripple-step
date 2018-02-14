import * as THREE from "./node_modules/three";

var Materials = {};

Materials.ripple = function(options) {
  var defaultOptions = {
    width: 512,
    height: 512,
  };
  options = Object.assign({}, defaultOptions, options);
  return new THREE.ShaderMaterial({
    name: "ripple",
    uniforms: {
      u_mainTex: {value: null}, // Texture of the current frame
      u_backTex: {value: null}, // Texture of the previous frame
      u_sceneTex: {value: null}, // New additions from the scene
      u_texelSize: {value: new THREE.Vector2(1/options.width, 1/options.height)},
      u_damping: {value: 0.999},
    },
    vertexShader: `
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 v_uv;

      uniform sampler2D u_mainTex;
      uniform sampler2D u_backTex;
      uniform sampler2D u_sceneTex;
      uniform vec2 u_texelSize;
      uniform float u_damping;

      vec2 offset[4];

      void main() {
        offset[0] = vec2(-1.0, 0.0);
        offset[1] = vec2(1.0, 0.0);
        offset[2] = vec2(0.0, 1.0);
        offset[3] = vec2(0.0, -1.0);

        vec4 sum = vec4(0.0);

        for (int i = 0; i < 4 ; i++){
          sum += texture2D(u_mainTex, v_uv + offset[i] * u_texelSize);
        }
        //  make an average and substract the center value
        sum = (sum / 2.0) - texture2D(u_backTex, v_uv);
        sum *= u_damping;

        vec4 sceneCol = texture2D(u_sceneTex, v_uv);
        gl_FragColor = sum + texture2D(u_sceneTex, v_uv);
      }
    `,
  });
};

export default Materials;
