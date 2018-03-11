import * as THREE from "../node_modules/three";
import {Constants} from "./AppData";

var SHADOW_KEY_MATERIAL = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.0,
});
var SHADOW_KEY_PLAYING_MATERIAL = new THREE.MeshBasicMaterial({color: new THREE.Color(0xffffff)});
var SHADOW_KEY_ARMED_MATERIAL = new THREE.MeshBasicMaterial({color: new THREE.Color(0x000000)});

function makeKeyShader() {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_rippleTex: {value: null},
      u_baseColor: {value: new THREE.Color(Constants.BASE_COLOR)},
      u_activeColor: {value: new THREE.Color()},
      u_relativePosition: {value: new THREE.Vector2()},
      u_armed: {value: 0},
      u_columnActive: {value: 0},
    },
    vertexShader: `
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D u_rippleTex;
      uniform vec3 u_baseColor;
      uniform vec3 u_activeColor;
      uniform vec2 u_relativePosition;
      uniform float u_armed;
      uniform float u_columnActive;
      varying vec2 v_uv;
      void main() {
        vec3 col = mix(u_baseColor, u_activeColor, u_armed);
        col = mix(col, vec3(1.0), u_columnActive * u_armed);
        vec3 rippleTex = texture2D(u_rippleTex, (v_uv + u_relativePosition) / 16.0).rgb;
        col += rippleTex * rippleTex;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function MatrixButton(row, column, geometry) {
  THREE.Mesh.call(this, geometry, makeKeyShader());
  this.row = row;
  this.column = column;
  this.shadow = new THREE.Mesh(geometry, SHADOW_KEY_MATERIAL);
  this.shadow.visible = false;

  var armed = false;

  this.arm = function() {
    armed = true;
    this.material.uniforms.u_armed.value = true;
    this.shadow.visible = true;
    this.shadow.material = SHADOW_KEY_ARMED_MATERIAL;
  };
  this.disarm = function() {
    armed = false;
    this.material.uniforms.u_armed.value = false;
    this.shadow.material = SHADOW_KEY_MATERIAL;
    this.shadow.visible = false;
  };
  this.isArmed = function() {
    return armed;
  };
}
MatrixButton.prototype = Object.create(THREE.Mesh.prototype);

function ToneMatrix(width, height) {
  THREE.Group.call(this);
  var keyGeometry = (function makeKeyGeometry() {
    var w = width + (width - 1) * Constants.SPACING_RATIO;
    var h = height + (height - 1) * Constants.SPACING_RATIO;
    var g = new THREE.PlaneBufferGeometry(1/w, 1/h);
    g.translate(0.5/w, 0.5/h, 0);
    return g;
  })();
  var buttons = [];
  var columns = [];

  this.shadowGroup = new THREE.Group();
  for (var col = 0; col < width; col++) {
    columns.push([]);
    for (var row = 0; row < height; row++) {
      var button = new MatrixButton(row, col, keyGeometry);
      button.material.uniforms.u_relativePosition.value = new THREE.Vector2(col, row);
      button.position.set(col - width/2, row - height/2, 0).multiplyScalar(1/width, 1/height, 1);
      button.shadow.position.copy(button.position);
      buttons.push(button);
      columns[col].push(button);
      this.add(button);
      this.shadowGroup.add(button.shadow);
    }
  }

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
  this.activateColumn = function(num) {
    // setButtonUniform("u_columnActive", false);
    var armedRows = [];
    columns[num].forEach(function(btn) {
      btn.material.uniforms.u_columnActive.value = true;
      if (btn.isArmed()) {
        armedRows.push(btn.row);
        btn.shadow.material = SHADOW_KEY_PLAYING_MATERIAL;
      }
    });
    return armedRows;
  };

  this.deactivateColumn = function(num) {
    columns[num].forEach(function(btn) {
      btn.material.uniforms.u_columnActive.value = false;
      if (btn.isArmed()) {
        btn.shadow.material = SHADOW_KEY_ARMED_MATERIAL;
      }
    });
  };

  this.setActiveColor = function(color, rippleColor) {
    setButtonUniform("u_activeColor", color);
    SHADOW_KEY_PLAYING_MATERIAL.color = rippleColor;
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
