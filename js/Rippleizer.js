import * as THREE from "../node_modules/three";
import Materials from "./Materials";
import {blitTexture} from "./Graphics";

// TODO refactor me

var rtOptions = {
  depthBuffer: false,
  stencilBuffer: false,
};
var RENDER_TEXTURE_RESOLUTION = 256; // TODO
// var RENDER_TEXTURE_RESOLUTION = 64; // TODO
// For off-screen, ripple renders
function makeShadowScene(group) {
  var shadowGroup = group; // TODO, find a way to clone this, law of demeter and all
  var scene = new THREE.Scene();
  scene.add(shadowGroup);
  var boundingBox = new THREE.Box3().setFromObject(shadowGroup);
  var bbSize = boundingBox.getSize();
  var camera = new THREE.OrthographicCamera(-bbSize.x/2, bbSize.x/2, bbSize.y/2, -bbSize.y/2, 0.1, 100);
  var target = new THREE.WebGLRenderTarget(RENDER_TEXTURE_RESOLUTION, RENDER_TEXTURE_RESOLUTION, rtOptions);
  camera.position.copy(boundingBox.getCenter());
  camera.position.z = 10;

  scene.texture = target.texture;
  scene.render = function(renderer) {
    renderer.render(scene, camera, target);
  };

  return scene;
}


var RATIO = 0.4; // TODO
function Rippleizer(renderer, group) {
  var rippleMaterial = Materials.ripple();
  var shadowScene = makeShadowScene(group);
  rippleMaterial.uniforms.u_sceneTex.value = shadowScene.texture;

  var subTextureResolution = RATIO * RENDER_TEXTURE_RESOLUTION;
  var mainTarget = new THREE.WebGLRenderTarget(subTextureResolution, subTextureResolution, rtOptions);
  var backTarget = mainTarget.clone();
  var finalTarget = mainTarget.clone();
  rippleMaterial.uniforms.u_texelSize.value = new THREE.Vector2(1/subTextureResolution, 1/subTextureResolution);

  function render() {
    shadowScene.render(renderer);
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
