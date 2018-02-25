import * as THREE from "../node_modules/three";
import Materials from "./Materials";
import {blitTexture} from "./Graphics";

// TODO refactor me

var rtOptions = {
  // format: THREE.AlphaFormat,
  // format: THREE.RGBFormat,
  depthBuffer: false,
  stencilBuffer: false,
};
var RATIO = 0.4; // TODO
// For off-screen, ripple renders
function makeShadowScene(renderer, group) {
  var shadowGroup = group; // TODO, find a way to clone this, law of demeter and all
  var subScene = new THREE.Scene();
  subScene.add(shadowGroup);
  var boundingBox = new THREE.Box3().setFromObject(shadowGroup);
  var bbSize = boundingBox.getSize();
  var subCamera = new THREE.OrthographicCamera(-bbSize.x/2, bbSize.x/2, bbSize.y/2, -bbSize.y/2, 0.1, 100);
  var target = new THREE.WebGLRenderTarget(RATIO * bbSize.x, RATIO * bbSize.y, rtOptions);
  subCamera.position.copy(boundingBox.getCenter());
  subCamera.position.z = 10;

  return {
    scene: subScene,
    camera: subCamera,
    target: target,
  };
}


function Rippleizer(renderer, group) {
  var rippleMaterial = Materials.ripple();
  var shadowScene = makeShadowScene(renderer, group);
  rippleMaterial.uniforms.u_sceneTex.value = shadowScene.target.texture;

  // TODO I think I'm only supposed to need two textures
  var rippleTex0 = new THREE.WebGLRenderTarget(RATIO * shadowScene.target.width, RATIO * shadowScene.target.height, rtOptions);
  var rippleTex1 = new THREE.WebGLRenderTarget(RATIO * shadowScene.target.width, RATIO * shadowScene.target.height, rtOptions);
  var rippleTex2 = new THREE.WebGLRenderTarget(RATIO * shadowScene.target.width, RATIO * shadowScene.target.height, rtOptions);
  var rippleTargets = [rippleTex0, rippleTex1, rippleTex2];
  rippleMaterial.uniforms.u_mainTex.value = rippleTex0;
  rippleMaterial.uniforms.u_backTex.value = rippleTex1;
  rippleMaterial.uniforms.u_texelSize.value = new THREE.Vector2(1/(RATIO * shadowScene.target.width), 1/(RATIO * shadowScene.target.height));

  var ripplePtr = 0;
  function render() {
    renderer.render(shadowScene.scene, shadowScene.camera, shadowScene.target);
    for (var i = 0; i < 1; i++) {
      ripplePtr = (ripplePtr + 1) % 3;
      rippleMaterial.uniforms.u_mainTex.value = rippleTargets[(ripplePtr + 2) % 3].texture;
      rippleMaterial.uniforms.u_backTex.value = rippleTargets[(ripplePtr + 1) % 3].texture;
      blitTexture(renderer, rippleMaterial, rippleTargets[ripplePtr]);
    }
  }

  function getActiveTexture() {
    return rippleTargets[ripplePtr].texture;
  }

  return {
    damping: rippleMaterial.uniforms.u_damping,
    render: render,
    getActiveTexture: getActiveTexture,
  };
}

export default Rippleizer;
