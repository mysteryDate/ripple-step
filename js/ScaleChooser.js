import {Group, ShaderMaterial, Color, Mesh, PlaneGeometry, MeshBasicMaterial} from "three";
import {Constants} from "./AppData";

var _baseColor = new Color(Constants.BASE_COLOR);
var _tmpColor = new Color();

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

function muteSoloInactiveColor(scaleColor) {
  return _tmpColor.copy(_baseColor).lerp(new Color(scaleColor), 0.15).clone();
}

function muteActiveColor(scaleColor) {
  return _tmpColor.set(0x888888).lerp(new Color(scaleColor), 0.2).clone();
}

function soloActiveColor(scaleColor) {
  return new Color(scaleColor);
}

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

      // Mute button (bottom-left corner of scale button)
      var muteBtn = new Mesh(
        new PlaneGeometry(0.4, 0.25),
        new MeshBasicMaterial({color: muteSoloInactiveColor(scales[scale].color)})
      );
      muteBtn.position.set(xPos - 0.3, -0.35, 0.1);
      muteBtn.scaleName = scale;
      muteBtn.buttonType = "mute";
      muteBtn.scaleColor = scales[scale].color;
      self.add(muteBtn);
      self.muteButtons.push(muteBtn);

      // Solo button (bottom-right corner of scale button)
      var soloBtn = new Mesh(
        new PlaneGeometry(0.4, 0.25),
        new MeshBasicMaterial({color: muteSoloInactiveColor(scales[scale].color)})
      );
      soloBtn.position.set(xPos + 0.3, -0.35, 0.1);
      soloBtn.scaleName = scale;
      soloBtn.buttonType = "solo";
      soloBtn.scaleColor = scales[scale].color;
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
  this.children.forEach(function(key) {
    if (key.material.uniforms && key.material.uniforms.u_mouseOver) {
      key.material.uniforms.u_mouseOver.value = false;
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
      btn.material.color.copy(
        muted ? muteActiveColor(btn.scaleColor) : muteSoloInactiveColor(btn.scaleColor)
      );
    }
  });
  this.scaleButtons.forEach(function(btn) {
    if (btn.scaleName === scaleName) {
      btn.material.uniforms.u_dimmed.value = muted;
    }
  });
};

ScaleChooser.prototype.toggleSolo = function(scaleName) {
  this.soloState[scaleName] = !this.soloState[scaleName];
  var soloed = this.soloState[scaleName];
  this.soloButtons.forEach(function(btn) {
    if (btn.scaleName === scaleName) {
      btn.material.color.copy(
        soloed ? soloActiveColor(btn.scaleColor) : muteSoloInactiveColor(btn.scaleColor)
      );
    }
  });
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
