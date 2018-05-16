import * as THREE from "../node_modules/three/build/three.min.js";

// Render a texture with a particular shader, useful for blurs
var blitTexture = (function() {
  var blitCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var subScene = new THREE.Scene();
  var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
  subScene.add(quad);

  return function bt(renderer, material, target) {
    quad.material = material;
    renderer.render(subScene, blitCamera, target);
    quad.material = null;
  };
})();

export {blitTexture};
