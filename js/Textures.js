import * as THREE from "../node_modules/three";

function AssetLoadError(message) {
  this.message = message;
  this.name = "AssetLoadError";
}
AssetLoadError.prototype = new Error();

var _textureCache = {};

var createTexture = function(filename, src) {
  var tex = new THREE.Texture(new Image());

  tex.image.onload = function() {
    tex.needsUpdate = true;
    _textureCache[filename].loaded = true;
  };
  tex.image.onerror = function() {
    console.warn("failed to load texture: " + filename);
  };
  _textureCache[filename] = {
    texture: tex,
    src: src,
    loaded: false,
  };
};

// get returns a THREE.Texture immediately, but also can accept a callback that
// will be called when the texture is actually loaded. Use the callback when you
// want to, for example, prevent rendering a mesh with a not-yet-loaded texture.
// The callback will be called with (err, texture).
// NOTE: Except in places where the texture is optional, you probably shouldn't
// use this. Use `promise` instead, to wait for the texture to load and more
// easily handle errors.
var get = function(filename, optionalCallback) {
  var cached = _textureCache[filename];
  if (!cached) {
    throw new Error(`No texture named "${filename}" exists`);
  }

  if (cached.loaded) {
    if (optionalCallback) {
      setTimeout(function() {
        optionalCallback(null, cached.texture);
      }, 0);
    }
    return cached.texture;
  }

  if (cached.parent) {
    cached.parent.texture.image.src = cached.parent.src;
    if (optionalCallback) {
      cached.parent.texture.image.addEventListener("load", function() {
        optionalCallback(null, cached.texture);
      });
      cached.parent.texture.image.addEventListener("error", function(e) {
        optionalCallback(new AssetLoadError(`Failed to load texture "${filename}"`), cached.texture);
      });
    }
    return cached.texture;
  }

  cached.texture.image.src = cached.src;

  if (optionalCallback) {
    cached.texture.image.addEventListener("load", function() {
      optionalCallback(null, cached.texture);
    });
    cached.texture.image.addEventListener("error", function(e) {
      optionalCallback(new AssetLoadError(`Failed to load texture "${filename}"`), cached.texture);
    });
  }
  return cached.texture;
};

// promise returns a Promise that resolves with the texture when it is loaded.
function promise(filename) {
  return new Promise(function(resolve, reject) {
    get(filename, function(err, tex) {
      if (err) {
        reject(err);
      } else {
        resolve(tex);
      }
    });
  });
}

// loadAll starts loading all textures immediately. This can be useful for
// calling at start up to get "eager" behavior.
var loadAll = function() {
  Object.keys(_textureCache).forEach(function(filename) {
    get(filename);
  });
};

export default {
  createTexture,
  get,
  promise,
  loadAll,
};
// export default Textures;
