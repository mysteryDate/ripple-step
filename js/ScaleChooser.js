import {Group, ShaderMaterial, Color, Mesh, PlaneGeometry, CanvasTexture, LinearFilter} from "three";
import {Constants} from "./AppData";

function makeChooserMaterial(color) {
  return new ShaderMaterial({
    uniforms: {
      u_color: {value: new Color(color)},
      u_baseColor: {value: new Color(Constants.BASE_COLOR)},
      u_mouseOver: {value: false},
      u_selected: {value: false},
      u_dimmed: {value: false},
      u_time: {value: 0.0},
    },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 u_color;
      uniform vec3 u_baseColor;
      uniform float u_mouseOver;
      uniform float u_selected;
      uniform float u_dimmed;
      uniform float u_time;
      void main() {
        vec3 color = mix(u_baseColor, u_color, 0.1);
        color = mix(color, u_color * 0.8, u_mouseOver);
        color = mix(color, u_color, u_selected);
        color += 0.05 * (sin(u_time / 200.0) * u_selected);
        color = mix(color, color * 0.35, u_dimmed);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

function makeMuteSoloMaterial(scaleColor, activeColor, texture) {
  return new ShaderMaterial({
    uniforms: {
      u_map: {value: texture},
      u_scaleColor: {value: new Color(scaleColor)},
      u_activeColor: {value: new Color(activeColor)},
      u_baseColor: {value: new Color(Constants.BASE_COLOR)},
      u_active: {value: false},
      u_mouseOver: {value: false},
    },
    vertexShader: `
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D u_map;
      uniform vec3 u_scaleColor;
      uniform vec3 u_activeColor;
      uniform vec3 u_baseColor;
      uniform float u_active;
      uniform float u_mouseOver;
      varying vec2 v_uv;
      void main() {
        float letter = texture2D(u_map, v_uv).r;

        vec3 inactiveBg = u_baseColor;
        vec3 inactiveLetter = mix(u_baseColor, u_scaleColor, 0.35);

        vec3 activeBg = u_activeColor * 0.7;
        vec3 activeLetter = vec3(1.0);

        vec3 bg = mix(inactiveBg, activeBg, u_active);
        vec3 lt = mix(inactiveLetter, activeLetter, u_active);

        vec3 col = mix(bg, lt, letter);
        col += vec3(0.1) * u_mouseOver;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function makeLetterTexture(letter) {
  var size = 512;
  var canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.font = size * 0.75 + "px bebas";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, size / 2, size / 2 + size * 0.02);
  var tex = new CanvasTexture(canvas);
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

var muteTexture = makeLetterTexture("M");
var soloTexture = makeLetterTexture("S");
document.fonts.ready.then(function() {
  var m = makeLetterTexture("M");
  muteTexture.image = m.image;
  muteTexture.needsUpdate = true;
  var s = makeLetterTexture("S");
  soloTexture.image = s.image;
  soloTexture.needsUpdate = true;
});

class ScaleChooser extends Group {
  constructor(scales, currentScale) {
    super();
    this.scales = scales;
    this.muteState = {};
    this.soloState = {};
    this.scaleButtons = [];
    this.muteButtons = [];
    this.soloButtons = [];

    var scaleNames = Object.keys(scales);
    var self = this;
    scaleNames.forEach(function(scale, index) {
      self.muteState[scale] = false;
      self.soloState[scale] = false;

      var xPos = index * (1 + Constants.SPACING_RATIO);
      xPos -= (scaleNames.length / 2 - 0.5) * (1 + Constants.SPACING_RATIO);

      // Scale picker button
      var pickerKey = new Mesh(
        new PlaneGeometry(1, 1),
        makeChooserMaterial(scales[scale].color)
      );
      pickerKey.position.set(xPos, 0, 0);
      pickerKey.scaleName = scale;
      pickerKey.buttonType = "scale";
      self.add(pickerKey);
      self.scaleButtons.push(pickerKey);

      if (scale === currentScale) {
        pickerKey.material.uniforms.u_selected.value = true;
      }

      // Mute button — inside bottom-left of scale button
      var muteBtn = new Mesh(
        new PlaneGeometry(0.42, 0.32),
        makeMuteSoloMaterial(scales[scale].color, scales[scale].color, muteTexture)
      );
      muteBtn.position.set(xPos - 0.25, -0.28, 0.1);
      muteBtn.scaleName = scale;
      muteBtn.buttonType = "mute";
      self.add(muteBtn);
      self.muteButtons.push(muteBtn);

      // Solo button — inside bottom-right of scale button
      var soloBtn = new Mesh(
        new PlaneGeometry(0.42, 0.32),
        makeMuteSoloMaterial(scales[scale].color, scales[scale].color, soloTexture)
      );
      soloBtn.position.set(xPos + 0.25, -0.28, 0.1);
      soloBtn.scaleName = scale;
      soloBtn.buttonType = "solo";
      self.add(soloBtn);
      self.soloButtons.push(soloBtn);
    });
  }
}

ScaleChooser.prototype.selectScale = function(scaleName) {
  this.scaleButtons.forEach(function(key) {
    key.material.uniforms.u_selected.value = (key.scaleName === scaleName);
  });
};

ScaleChooser.prototype.touchStart = function(raycaster) {
  var intersects = raycaster.intersectObjects(this.children);
  if (intersects.length === 0) return;

  var clicked = intersects[0].object;

  if (clicked.buttonType === "scale") {
    this.scaleButtons.forEach(function(key) {
      key.material.uniforms.u_selected.value = false;
    });
    clicked.material.uniforms.u_selected.value = true;
    window.app.setScale(this.scales[clicked.scaleName]);
    mixpanel.track("Scale Set");
  } else if (clicked.buttonType === "mute") {
    this.toggleMute(clicked.scaleName);
  } else if (clicked.buttonType === "solo") {
    this.toggleSolo(clicked.scaleName);
  }
};

ScaleChooser.prototype.touch = function(raycaster) {
  this.children.forEach(function(child) {
    if (child.material.uniforms && child.material.uniforms.u_mouseOver) {
      child.material.uniforms.u_mouseOver.value = false;
    }
  });
  var touched = raycaster.intersectObjects(this.children)[0];
  if (touched !== undefined) {
    var obj = touched.object;
    if (obj.material.uniforms && obj.material.uniforms.u_mouseOver) {
      obj.material.uniforms.u_mouseOver.value = true;
    }
  }
};

ScaleChooser.prototype.setVertical = function(isVertical) {
  var angle = isVertical ? -Math.PI / 2 : 0;
  this.muteButtons.concat(this.soloButtons).forEach(function(btn) {
    btn.rotation.z = angle;
  });
};

ScaleChooser.prototype.update = function(time) {
  this.scaleButtons.forEach(function(key) {
    key.material.uniforms.u_time.value = time;
  });
};

ScaleChooser.prototype.toggleMute = function(scaleName) {
  this.muteState[scaleName] = !this.muteState[scaleName];
  var muted = this.muteState[scaleName];
  this.muteButtons.forEach(function(btn) {
    if (btn.scaleName === scaleName) {
      btn.material.uniforms.u_active.value = muted;
    }
  });
  this.scaleButtons.forEach(function(btn) {
    if (btn.scaleName === scaleName) {
      btn.material.uniforms.u_dimmed.value = muted;
    }
  });
};

ScaleChooser.prototype.toggleSolo = function(scaleName) {
  var wasAlreadySoloed = this.soloState[scaleName];
  Object.keys(this.soloState).forEach(function(name) {
    this.soloState[name] = false;
  }.bind(this));
  this.soloButtons.forEach(function(btn) {
    btn.material.uniforms.u_active.value = false;
  });
  if (!wasAlreadySoloed) {
    this.soloState[scaleName] = true;
    this.soloButtons.forEach(function(btn) {
      if (btn.scaleName === scaleName) {
        btn.material.uniforms.u_active.value = true;
      }
    });
  }
};

ScaleChooser.prototype.isScaleAudible = function(scaleName) {
  var anySolo = false;
  var self = this;
  Object.keys(this.soloState).forEach(function(name) {
    if (self.soloState[name]) anySolo = true;
  });
  if (anySolo) {
    return this.soloState[scaleName] && !this.muteState[scaleName];
  }
  return !this.muteState[scaleName];
};

export default ScaleChooser;
