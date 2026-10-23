import {OrthographicCamera, Scene, Mesh, PlaneGeometry, Color} from "three";

// Render a texture with a particular shader, useful for blurs
var blitTexture = (function() {
  var blitCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var subScene = new Scene();
  var quad = new Mesh(new PlaneGeometry(2, 2), null);
  subScene.add(quad);

  return function bt(renderer, material, target) {
    quad.material = material;
    renderer.setRenderTarget(target);
    renderer.render(subScene, blitCamera);
    renderer.setRenderTarget(null);
    quad.material = null;
  };
})();

// Moves a colour toward its HSL lightness, which scales HSL saturation linearly
function desaturate(color, saturation) {
  var lightness = (Math.max(color.r, color.g, color.b) + Math.min(color.r, color.g, color.b)) / 2;
  return new Color(lightness, lightness, lightness).lerp(color, saturation);
}

export {blitTexture, desaturate};
