import {Scene, Box3, Vector3, OrthographicCamera, WebGLRenderTarget, Vector2} from "three";
import Materials from "./Materials";
import {blitTexture} from "./Graphics";

var rtOptions = {
  depthBuffer: false,
  stencilBuffer: false,
};
var RENDER_TEXTURE_RESOLUTION = 256;
// For off-screen, ripple renders
function makeShadowScene(group) {
  var shadowGroup = group; // TODO, find a way to clone this, law of demeter and all
  var scene = new Scene();
  scene.add(shadowGroup);
  var boundingBox = new Box3().setFromObject(shadowGroup);
  var bbSize = boundingBox.getSize(new Vector3());
  var camera = new OrthographicCamera(-bbSize.x/2, bbSize.x/2, bbSize.y/2, -bbSize.y/2, 0.1, 100);
  var target = new WebGLRenderTarget(RENDER_TEXTURE_RESOLUTION, RENDER_TEXTURE_RESOLUTION, rtOptions);
  camera.position.copy(boundingBox.getCenter(new Vector3()));
  camera.position.z = 10;

  scene.texture = target.texture;
  scene.render = function(renderer) {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
  };

  return scene;
}

var RATIO = 0.4;
function Rippleizer(group) {
  var rippleMaterial = Materials.ripple();
  var shadowScene = makeShadowScene(group);
  rippleMaterial.uniforms.u_sceneTex.value = shadowScene.texture;

  var subTextureResolution = RATIO * RENDER_TEXTURE_RESOLUTION;
  var mainTarget = new WebGLRenderTarget(subTextureResolution, subTextureResolution, rtOptions);
  var backTarget = mainTarget.clone();
  var finalTarget = mainTarget.clone();
  rippleMaterial.uniforms.u_texelSize.value = new Vector2(1/subTextureResolution, 1/subTextureResolution);

  function render(renderer, shadowDirty) {
    if (shadowDirty !== false) {
      shadowScene.render(renderer);
    }
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
    getActiveTexture: getActiveTexture,
    render: render,
  };
}

export default Rippleizer;
