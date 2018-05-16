import * as THREE from "../node_modules/three";
import {Constants} from "./AppData";
import Materials from "./Materials";

function makeKeyMaterial(options) {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_rippleTex: {value: null},
      u_baseColor: {value: new THREE.Color(Constants.BASE_COLOR)},
      u_activeColor: {value: new THREE.Color()},
      u_muted: {value: false},
      u_activeColumn: {value: -1},
    },
    vertexShader: `
      attribute vec2 relativePosition;
      attribute float isArmed;
      varying vec2 v_relativePosition;
      varying float v_armed;
      varying vec2 v_uv;
      ${Materials.Include.map}
      const float numSteps = ${Constants.NUM_STEPS.toFixed(3)};
      void main() {
        v_uv = uv;
        v_armed = isArmed;
        v_relativePosition = relativePosition;
        vec2 offset = map(relativePosition, 0.0, numSteps, 0.0, 1.0);
        vec3 pos = vec3(position.xy + offset - 0.5, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      #define NUM_STEPS ${(Constants.NUM_STEPS).toFixed(3)}
      uniform sampler2D u_rippleTex;
      uniform vec3 u_baseColor;
      uniform vec3 u_activeColor;
      uniform float u_muted;
      uniform float u_activeColumn;
      varying vec2 v_uv;
      varying vec2 v_relativePosition;
      varying float v_armed;

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
        col = mix(u_baseColor, col, v_armed);
        float isColumnActive = 1.0 - step(0.1, abs(u_activeColumn - v_relativePosition.x));
        col = mix(col, vec3(1.0), isColumnActive * v_armed);
        vec3 rippleTex = texture2D(u_rippleTex, (v_uv + v_relativePosition) / NUM_STEPS).rgb;
        col += rippleTex * rippleTex;

        float rect = squareSDF(v_uv);
        col *= 1.0 - step(1.0 - ${Constants.SPACING_RATIO.toFixed(3)}, rect);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function makeShadowKeyMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      u_activeColor: {value: new THREE.Color("#ffffff")},
      u_muted: {value: false},
      u_activeColumn: {value: -1},
    },
    vertexShader: `
      attribute vec2 relativePosition;
      attribute float isArmed;
      varying vec2 v_relativePosition;
      varying float v_armed;
      ${Materials.Include.map}
      const float numSteps = ${Constants.NUM_STEPS.toFixed(3)};
      void main() {
        v_armed = isArmed;
        v_relativePosition = relativePosition;
        vec2 offset = map(relativePosition, 0.0, numSteps, 0.0, 1.0);
        vec3 pos = vec3(position.xy + offset - 0.5, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 u_activeColor;
      uniform float u_muted;
      uniform float u_activeColumn;
      varying vec2 v_relativePosition;
      varying float v_armed;

      #define MUTE_COLOR_VALUE ${Constants.MUTE_COLOR_VALUE.toFixed(3)}
      void main() {
        vec3 col = mix(u_activeColor, u_activeColor * MUTE_COLOR_VALUE, u_muted);
        float isColumnActive = 1.0 - step(0.1, abs(u_activeColumn - v_relativePosition.x));

        float opacity = v_armed * isColumnActive;
        gl_FragColor = vec4(col, opacity);
      }
    `,
  });
}

var KEY_MATERIAL = makeKeyMaterial();
var SHADOW_KEY_MATERIAL = makeShadowKeyMaterial();

function MatrixButton(row, column, geometry, armedBuffer) {
  this.row = row;
  this.column = column;

  var armed = false;

  this.arm = function() {
    armed = true;
    armedBuffer.setX(column * Constants.NUM_STEPS + row, 1);
    armedBuffer.needsUpdate = true;
  };
  this.disarm = function() {
    armed = false;
    armedBuffer.setX(column * Constants.NUM_STEPS + row, 0);
    armedBuffer.needsUpdate = true;
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
    /* Copied from PlaneBufferGeometry
    0 ----- 1
    |       |
    |       |
    2 ----- 3
    */
    var positions = [0, 1/h, 0, 1/w, 1/h, 0, 0, 0, 0, 1/w, 0, 0];
    var indices = [0, 2, 1, 2, 3, 1];
    var uvs = [0, 1, 1, 1, 0, 0, 1, 0];

    var g = new THREE.InstancedBufferGeometry();
    g.addAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    g.setIndex(indices);
    g.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
    return g;
  })();
  var buttons = [];
  var columns = [];
  var numButtons = numHorizontalSteps * numVerticalSteps;
  var relativePositions = new THREE.InstancedBufferAttribute(new Float32Array(numButtons * 2), 2, 1);
  var armedBuffer = new THREE.InstancedBufferAttribute(new Float32Array(numButtons), 1, 1); // 0 = inactive, 1 = armed
  // var relativePositions = new THREE.InstancedBufferAttribute(new Float32Array(2), 2, 1);

  this.shadowGroup = new THREE.Group();
  for (var col = 0; col < numHorizontalSteps; col++) {
    columns.push([]);
    for (var row = 0; row < numVerticalSteps; row++) {
      var button = new MatrixButton(row, col, keyGeometry, armedBuffer);
      // button.material.uniforms.u_relativePosition.value = new THREE.Vector2(col, row);
      relativePositions.setXY(col * numHorizontalSteps + row, col, row);
      armedBuffer.setX(col * numHorizontalSteps + row, 0); // Set all to inactive
      // button.position.set(col - numHorizontalSteps/2, row - numVerticalSteps/2, 0).multiplyScalar(1/numHorizontalSteps, 1/numVerticalSteps, 1);
      // var buttonPosition = new THREE.Vector3(col - numHorizontalSteps/2, row - numVerticalSteps/2, 0).multiplyScalar(1/numHorizontalSteps, 1/numVerticalSteps, 1);
      // button.shadow.position.copy(buttonPosition);
      buttons.push(button);
      columns[col].push(button);
      // this.add(button);
      // this.shadowGroup.add(button.shadow);
    }
  }
  this.columns = columns;
  // console.log(keyGeometry);
  armedBuffer.setDynamic(true);
  keyGeometry.addAttribute("relativePosition", relativePositions);
  keyGeometry.addAttribute("isArmed", armedBuffer);
  // this.add(new THREE.Mesh(keyGeometry, SHADOW_KEY_MATERIAL));
  this.add(new THREE.Mesh(keyGeometry, KEY_MATERIAL));
  this.shadowGroup.add(new THREE.Mesh(keyGeometry, SHADOW_KEY_MATERIAL));

  this.clickScreen = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({color: "pink", wireframe: true}));
  this.add(this.clickScreen);
  this.clickScreen.position.z += 10;
  this.shadowClickScreen = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({color: "pink", wireframe: true}));
  this.shadowClickScreen.visible = false;
  this.shadowGroup.add(this.shadowClickScreen);

  // var rippleizer = new Rippleizer(renderer, toneMatrix.shadowGroup); // TODO should live here

  function setButtonUniform(uniformName, value, shadowValue) {
    KEY_MATERIAL.uniforms[uniformName].value = value;
    if (shadowValue === undefined) shadowValue = value;
    if (SHADOW_KEY_MATERIAL.uniforms[uniformName] !== undefined) {
      SHADOW_KEY_MATERIAL.uniforms[uniformName].value = shadowValue;
    }
  }

  this.numHorizontalSteps = numHorizontalSteps;
  this.numVerticalSteps = numVerticalSteps;

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
        // if (!isMuted) {
        //   // btn.material = KEY_PLAYING_MATERIAL;
        //   // btn.shadow.material = SHADOW_KEY_PLAYING_MATERIAL;
        // } else {
        //   // btn.shadow.material = SHADOW_KEY_PLAYING_MUTED_MATERIAL;
        // }
      }
    });
    return armedRows;
  };

  // this.deactivateColumn = function(num) {
  //   columns[num].forEach(function(btn) {
  //     if (btn.isArmed()) {
  //       // btn.material = KEY_ARMED_MATERIAL;
  //       // btn.shadow.material = SHADOW_KEY_ARMED_MATERIAL;
  //     }
  //   });
  // };

  this.setActiveColor = function({buttonColor, shadowColor}) {
    setButtonUniform("u_activeColor", buttonColor, shadowColor);
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

function uvToButtonIndex(uv, width, height) {
  var result = uv.clone().multiply(new THREE.Vector2(width, height));
  result.x = Math.floor(result.x);
  result.y = Math.floor(result.y);
  return result;
}

ToneMatrix.prototype = Object.create(THREE.Object3D.prototype);

ToneMatrix.prototype.touch = function(raycaster) {
  var intersection = raycaster.intersectObject(this.clickScreen)[0];
  // var t = raycaster.intersectObject(this);
  if (intersection && this.touchActive) {
    var address = uvToButtonIndex(intersection.uv, this.numHorizontalSteps, this.numVerticalSteps); // TODO
    var touchedButton = this.columns[address.x][address.y];
    if (this.arming === true) {
      touchedButton.arm();
    } else {
      touchedButton.disarm();
    }
  }
};
ToneMatrix.prototype.touchStart = function(raycaster) {
  var intersection = raycaster.intersectObject(this.clickScreen)[0];
  // var t = raycaster.intersectObject(this);
  if (intersection) {
    var address = uvToButtonIndex(intersection.uv, this.numHorizontalSteps, this.numVerticalSteps); // TODO
    var touchedButton = this.columns[address.x][address.y];
    this.arming = !touchedButton.isArmed();
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
