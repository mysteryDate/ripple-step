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
var renderTextureSize = 256; // TODO
// For off-screen, ripple renders
function makeShadowScene(renderer, group) {
  var shadowGroup = group; // TODO, find a way to clone this, law of demeter and all
  var subScene = new THREE.Scene();
  subScene.add(shadowGroup);
  var boundingBox = new THREE.Box3().setFromObject(shadowGroup);
  var bbSize = boundingBox.getSize();
  var subCamera = new THREE.OrthographicCamera(-bbSize.x/2, bbSize.x/2, bbSize.y/2, -bbSize.y/2, 0.1, 100);
  var target = new THREE.WebGLRenderTarget(renderTextureSize, renderTextureSize, rtOptions);
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

  var mainTarget = new THREE.WebGLRenderTarget(RATIO * shadowScene.target.width, RATIO * shadowScene.target.height, rtOptions);
  var backTarget = mainTarget.clone();
  var finalTarget = mainTarget.clone();
  rippleMaterial.uniforms.u_texelSize.value = new THREE.Vector2(1/(RATIO * shadowScene.target.width), 1/(RATIO * shadowScene.target.height));

  function render() {
    renderer.render(shadowScene.scene, shadowScene.camera, shadowScene.target);
    rippleMaterial.uniforms.u_mainTex.value = mainTarget.texture;
    rippleMaterial.uniforms.u_backTex.value = backTarget.texture;
    blitTexture(renderer, rippleMaterial, finalTarget);
    [finalTarget, backTarget, mainTarget] = [backTarget, mainTarget, finalTarget]; // Ping-pong
  }

  function getActiveTexture() {
    return finalTarget.texture;
  }

  return {
    damping: rippleMaterial.uniforms.u_damping,
    render: render,
    getActiveTexture: getActiveTexture,
  };
}

export default Rippleizer;
