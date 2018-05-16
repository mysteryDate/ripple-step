import * as THREE from "../node_modules/three";
import {Constants} from "./AppData";

var SHADOW_KEY_MATERIAL = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.0,
});
var SHADOW_KEY_PLAYING_MATERIAL = new THREE.MeshBasicMaterial({color: new THREE.Color(0xffffff)});
var SHADOW_KEY_PLAYING_MUTED_MATERIAL = new THREE.MeshBasicMaterial({color: new THREE.Color(0xcccccc)});
var SHADOW_KEY_ARMED_MATERIAL = new THREE.MeshBasicMaterial({color: new THREE.Color(0x000000)});

function makeKeyMaterial(options) {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_rippleTex: {value: null},
      u_baseColor: {value: new THREE.Color(Constants.BASE_COLOR)},
      u_activeColor: {value: new THREE.Color()},
      // u_relativePosition: {value: new THREE.Vector2()},
      u_armed: {value: (options.armed !== undefined) ? options.armed : false},
      u_muted: {value: (options.muted !== undefined) ? options.muted : false},
      u_playing: {value: (options.playing !== undefined) ? options.playing : false},
      u_activeColumn: {value: -1},
    },
    vertexShader: `
      attribute vec2 relativePosition;
      varying vec2 v_relativePosition;
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        v_relativePosition = relativePosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      #define NUM_STEPS ${(Constants.NUM_STEPS).toFixed(3)}
      uniform sampler2D u_rippleTex;
      uniform vec3 u_baseColor;
      uniform vec3 u_activeColor;
      // uniform vec2 u_relativePosition;
      uniform float u_armed;
      uniform float u_muted;
      uniform float u_playing;
      uniform float u_activeColumn;
      varying vec2 v_uv;
      varying vec2 v_relativePosition;

      float rectangleSDF(vec2 st, vec2 s) {
        st = st * 2.0 - 1.0;
        return max(abs(st.x/s.x), abs(st.y/s.y));
      }

      float squareSDF(vec2 st) {
        return rectangleSDF(st, vec2(1.0));
      }

      #define MUTE_COLOR_VALUE ${Constants.MUTE_COLOR_VALUE.toFixed(3)}
      void main() {
        vec3 col = mix(u_activeColor, u_activeColor * MUTE_COLOR_VALUE, u_muted);
        col = mix(u_baseColor, col, u_armed);
        vec3 playingColor = 2.0 * col * mix(1.0, MUTE_COLOR_VALUE, u_muted);
        col = mix(col, vec3(1.0), u_playing);
        vec3 rippleTex = texture2D(u_rippleTex, (v_uv + v_relativePosition) / NUM_STEPS).rgb;
        col += rippleTex * rippleTex;

        float rect = squareSDF(v_uv);
        col *= 1.0 - step(1.0 - ${Constants.SPACING_RATIO.toFixed(3)}, rect);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

var KEY_UNARMED_MATERIAL = makeKeyMaterial({armed: false});
var KEY_ARMED_MATERIAL = makeKeyMaterial({armed: true});
var KEY_PLAYING_MATERIAL = makeKeyMaterial({playing: true});

function MatrixButton(row, column, geometry) {
  THREE.Mesh.call(this, geometry, KEY_UNARMED_MATERIAL);
  this.row = row;
  this.column = column;
  this.shadow = new THREE.Mesh(geometry, SHADOW_KEY_MATERIAL);
  this.shadow.visible = false;

  var armed = false;

  this.arm = function() {
    armed = true;
    this.material = KEY_ARMED_MATERIAL;
    this.shadow.visible = true;
    this.shadow.material = SHADOW_KEY_MATERIAL;
  };
  this.disarm = function() {
    armed = false;
    this.material = KEY_UNARMED_MATERIAL;
    this.shadow.material = SHADOW_KEY_MATERIAL;
    this.shadow.visible = false;
  };
  this.isArmed = function() {
    return armed;
  };
}
MatrixButton.prototype = Object.create(THREE.Mesh.prototype);

function ToneMatrix(numHorizontalSteps, numVerticalSteps) {
  THREE.Group.call(this);
  var keyGeometry = (function makeKeyGeometry() {
    var w = numHorizontalSteps;
    var h = numVerticalSteps;
    var g = new THREE.PlaneBufferGeometry(1/w, 1/h);
    g.translate(0.5/w, 0.5/h, 0);
    return g;
  })();
  var buttons = [];
  var columns = [];

  this.shadowGroup = new THREE.Group();
  for (var col = 0; col < numHorizontalSteps; col++) {
    columns.push([]);
    for (var row = 0; row < numVerticalSteps; row++) {
      var button = new MatrixButton(row, col, keyGeometry);
      button.material.uniforms.u_relativePosition.value = new THREE.Vector2(col, row);
      button.position.set(col - numHorizontalSteps/2, row - numVerticalSteps/2, 0).multiplyScalar(1/numHorizontalSteps, 1/numVerticalSteps, 1);
      button.shadow.position.copy(button.position);
      buttons.push(button);
      columns[col].push(button);
      this.add(button);
      this.shadowGroup.add(button.shadow);
    }
  }

  // var rippleizer = new Rippleizer(renderer, toneMatrix.shadowGroup);

  function setButtonUniform(uniform, value) {
    buttons.forEach(function(btn) {
      btn.material.uniforms[uniform].value = value;
    });
  }

  this.armButton = function(x, y) {
    columns[x][y].arm();
  };
  this.getButton = function(x, y) {
    return columns[x][y];
  };
  this.activateColumn = function(num, isMuted) {
    var armedRows = [];
    setButtonUniform("u_activeColumn", num);
    columns[num].forEach(function(btn, index) {
      if (btn.isArmed()) {
        armedRows.push(btn.row);
        if (!isMuted) {
          btn.material = KEY_PLAYING_MATERIAL;
          btn.shadow.material = SHADOW_KEY_PLAYING_MATERIAL;
        } else {
          btn.shadow.material = SHADOW_KEY_PLAYING_MUTED_MATERIAL;
        }
      }
    });
    return armedRows;
  };

  this.deactivateColumn = function(num) {
    columns[num].forEach(function(btn) {
      if (btn.isArmed()) {
        btn.material = KEY_ARMED_MATERIAL;
        btn.shadow.material = SHADOW_KEY_ARMED_MATERIAL;
      }
    });
  };

  this.setActiveColor = function({buttonColor, shadowColor}) {
    setButtonUniform("u_activeColor", buttonColor);
    SHADOW_KEY_PLAYING_MATERIAL.color = shadowColor;
    SHADOW_KEY_PLAYING_MUTED_MATERIAL.color = shadowColor.clone().multiplyScalar(0.02);
  };

  this.mute = function(value) {
    setButtonUniform("u_muted", value);
  };

  this.setRippleTexture = function(texture) {
    setButtonUniform("u_rippleTex", texture);
  };

  // Some hacky debouncing
  this.arming = true;
  this.touchActive = false;
}
ToneMatrix.prototype = Object.create(THREE.Object3D.prototype);

ToneMatrix.prototype.touch = function(raycaster) {
  var touchedButton = raycaster.intersectObjects(this.children)[0];
  if (touchedButton && this.touchActive) {
    if (this.arming === true) {
      touchedButton.object.arm();
    } else {
      touchedButton.object.disarm();
    }
  }
};
ToneMatrix.prototype.touchStart = function(raycaster) {
  var touchedButton = raycaster.intersectObjects(this.children)[0];
  if (touchedButton) {
    this.arming = !touchedButton.object.isArmed();
    this.touchActive = true;
  }
  this.touch(raycaster);
};
ToneMatrix.prototype.touchEnd = function() {
  this.touchActive = false;
};

ToneMatrix.prototype.clear = function() {
  this.children.forEach(function(button) {
    button.disarm();
  });
};

export default ToneMatrix;
