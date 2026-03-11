import * as THREE from "../node_modules/three/build/three.min.js";
import {Constants} from "./AppData"; // TODO pass in as options
import Materials from "./Materials";
import Rippleizer from "./Rippleizer";

var bgColor = new THREE.Color(Constants.BACKGROUND_COLOR);

function makeKeyMaterial(options) {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_numHorizontalNotes: {value: options.numHorizontalNotes},
      u_baseColor: {value: new THREE.Color(options.baseColor)},
      u_numVerticalNotes: {value: options.numVerticalNotes},
      u_activeColumn: {value: -1},
      u_rippleTex: {value: null},
      u_muted: {value: false},
    },
    vertexShader: `
      attribute vec2 relativePosition;
      attribute float isArmed;
      attribute vec3 buttonColor;
      uniform float u_numHorizontalNotes;
      uniform float u_numVerticalNotes;
      varying vec2 v_relativePosition;
      varying vec2 v_uv;
      varying float v_armed;
      varying vec3 v_buttonColor;
      ${Materials.Include.map}
      void main() {
        v_uv = uv;
        v_armed = isArmed;
        v_relativePosition = relativePosition;
        v_buttonColor = buttonColor;

        vec2 offset = map(relativePosition, vec2(0.0), vec2(u_numHorizontalNotes, u_numVerticalNotes), vec2(0.0), vec2(1.0));
        vec3 pos = vec3(position.xy + offset - 0.5, 1.0); // Center it with -0.5

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D u_rippleTex;
      uniform vec3 u_baseColor;
      uniform float u_numHorizontalNotes;
      uniform float u_numVerticalNotes;
      uniform float u_activeColumn;
      uniform float u_muted;
      varying vec2 v_relativePosition;
      varying vec2 v_uv;
      varying float v_armed;
      varying vec3 v_buttonColor;

      float rectangleSDF(vec2 st, vec2 s) {
        st = st * 2.0 - 1.0;
        return max(abs(st.x/s.x), abs(st.y/s.y));
      }

      float squareSDF(vec2 st) {
        return rectangleSDF(st, vec2(1.0));
      }

      #define MUTE_COLOR_VALUE ${Constants.MUTE_COLOR_VALUE.toFixed(3)}
      void main() {
        vec3 col = mix(v_buttonColor, v_buttonColor * MUTE_COLOR_VALUE, u_muted);
        col = mix(u_baseColor, col, v_armed);
        float isColumnActive = 1.0 - step(0.1, abs(u_activeColumn - v_relativePosition.x));
        col = mix(col, vec3(1.0), isColumnActive * v_armed);

        vec3 rippleTex = texture2D(u_rippleTex, (v_uv + v_relativePosition) / vec2(u_numHorizontalNotes, u_numVerticalNotes)).rgb;
        col += rippleTex * rippleTex;

        float rect = squareSDF(v_uv);
        float isGap = step(1.0 - ${Constants.SPACING_RATIO.toFixed(3)}, rect);
        vec3 bgCol = vec3(${bgColor.r.toFixed(3)}, ${bgColor.g.toFixed(3)}, ${bgColor.b.toFixed(3)});
        col = mix(col, bgCol, isGap);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function makeShadowKeyMaterial(options) {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      u_numHorizontalNotes: {value: options.numHorizontalNotes},
      u_numVerticalNotes: {value: options.numVerticalNotes},
      u_activeColumn: {value: -1},
      u_muted: {value: false},
    },
    vertexShader: `
      attribute vec2 relativePosition;
      attribute float isArmed;
      attribute vec3 buttonShadowColor;
      uniform float u_numHorizontalNotes;
      uniform float u_numVerticalNotes;
      varying vec2 v_relativePosition;
      varying float v_armed;
      varying vec3 v_shadowColor;
      ${Materials.Include.map}
      void main() {
        v_armed = isArmed;
        v_relativePosition = relativePosition;
        v_shadowColor = buttonShadowColor;
        vec2 offset = map(relativePosition, vec2(0.0), vec2(u_numHorizontalNotes, u_numVerticalNotes), vec2(0.0), vec2(1.0));
        vec3 pos = vec3(position.xy + offset - 0.5, 1.0); // Center it with -0.5
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float u_muted;
      uniform float u_activeColumn;
      varying vec2 v_relativePosition;
      varying float v_armed;
      varying vec3 v_shadowColor;
      #define MUTE_COLOR_VALUE ${Constants.MUTE_COLOR_VALUE.toFixed(3)}
      void main() {
        vec3 col = mix(v_shadowColor, v_shadowColor * MUTE_COLOR_VALUE, u_muted);

        float isColumnActive = 1.0 - step(0.1, abs(u_activeColumn - v_relativePosition.x));
        float opacity = v_armed * isColumnActive;

        gl_FragColor = vec4(col, opacity);
      }
    `,
  });
}

function MatrixButton(column, row, buttonIndex, armedBuffer, colorBuffer, shadowColorBuffer) {
  this.column = column;
  this.row = row;
  this.scale = null;
  var armed = false;

  this.arm = function(color, shadowColor, scale) {
    armed = true;
    armedBuffer.setX(buttonIndex, 1);
    armedBuffer.needsUpdate = true;
    if (color) {
      colorBuffer.setXYZ(buttonIndex, color.r, color.g, color.b);
      colorBuffer.needsUpdate = true;
    }
    if (shadowColor) {
      shadowColorBuffer.setXYZ(buttonIndex, shadowColor.r, shadowColor.g, shadowColor.b);
      shadowColorBuffer.needsUpdate = true;
    }
    this.scale = scale || null;
  };
  this.disarm = function() {
    armed = false;
    armedBuffer.setX(buttonIndex, 0);
    armedBuffer.needsUpdate = true;
    this.scale = null;
  };
  this.isArmed = function() {
    return armed;
  };
}
MatrixButton.prototype = Object.create(THREE.Mesh.prototype);

function ToneMatrix(numHorizontalSteps, numVerticalSteps) {
  THREE.Group.call(this);
  // Some hacky debouncing
  var arming = true;
  var touchActive = false;

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
  var colorBuffer = new THREE.InstancedBufferAttribute(new Float32Array(numButtons * 3), 3, 1);
  var shadowColorBuffer = new THREE.InstancedBufferAttribute(new Float32Array(numButtons * 3), 3, 1);

  // Current scale state for newly armed buttons
  var currentButtonColor = new THREE.Color(0xffffff);
  var currentShadowColor = new THREE.Color(0xffffff);
  var currentScale = null;

  var shadowGroup = new THREE.Group();
  var buttonIndex = 0;
  for (var col = 0; col < numHorizontalSteps; col++) {
    columns.push([]);
    for (var row = 0; row < numVerticalSteps; row++) {
      var button = new MatrixButton(col, row, buttonIndex, armedBuffer, colorBuffer, shadowColorBuffer);
      relativePositions.setXY(buttonIndex, col, row);
      armedBuffer.setX(buttonIndex, 0); // Set all to inactive
      buttons.push(button);
      columns[col].push(button);
      buttonIndex++;
    }
  }
  armedBuffer.setDynamic(true);
  colorBuffer.setDynamic(true);
  shadowColorBuffer.setDynamic(true);
  keyGeometry.addAttribute("relativePosition", relativePositions);
  keyGeometry.addAttribute("isArmed", armedBuffer);
  keyGeometry.addAttribute("buttonColor", colorBuffer);
  keyGeometry.addAttribute("buttonShadowColor", shadowColorBuffer);
  var keyMaterial = makeKeyMaterial({
    numHorizontalNotes: numHorizontalSteps,
    numVerticalNotes: numVerticalSteps,
    baseColor: Constants.BASE_COLOR,
  });
  this.add(new THREE.Mesh(keyGeometry, keyMaterial));

  // Because the instanced buffer geometries don't have true bounding boxes
  var clickScreen = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
  this.add(clickScreen);

  var shadowKeyMaterial = makeShadowKeyMaterial({numHorizontalNotes: numHorizontalSteps, numVerticalNotes: numVerticalSteps});
  shadowGroup.add(new THREE.Mesh(keyGeometry, shadowKeyMaterial));
  shadowGroup.add(clickScreen.clone()); // So that it has a proper BB
  var rippleizer = new Rippleizer(shadowGroup);

  function setButtonUniform(uniformName, value, shadowValue) {
    keyMaterial.uniforms[uniformName].value = value;
    if (shadowValue === undefined) shadowValue = value;
    if (shadowKeyMaterial.uniforms[uniformName] !== undefined) {
      shadowKeyMaterial.uniforms[uniformName].value = shadowValue;
    }
  }

  function setCurrentScale(color, shadowColor, scale) {
    currentButtonColor = color;
    currentShadowColor = shadowColor;
    currentScale = scale;
  }

  function armButton(x, y) {
    columns[x][y].arm(currentButtonColor, currentShadowColor, currentScale);
  }

  function getButton(x, y) {
    return columns[x][y];
  }

  function clear() {
    buttons.forEach(function(btn) {
      btn.disarm();
    });
  }

  function getActiveNotesInColumn(columnNum) {
    var activeNotesInColumn = [];
    columns[columnNum].forEach(function(btn) {
      if (btn.isArmed()) {
        activeNotesInColumn.push({row: btn.row, scale: btn.scale});
      }
    });
    return activeNotesInColumn;
  }

  function uvToButtonIndex(uv) {
    var result = uv.clone().multiply(new THREE.Vector2(numHorizontalSteps, numVerticalSteps));
    result.x = Math.floor(result.x);
    result.y = Math.floor(result.y);
    return result;
  }

  function setDamping(newDamping) {
    rippleizer.damping.value = newDamping;
  }

  function render(renderer) {
    rippleizer.render(renderer);
    setButtonUniform("u_rippleTex", rippleizer.getActiveTexture());
  }

  Object.assign(this, {
    getActiveNotesInColumn: getActiveNotesInColumn,
    setButtonUniform: setButtonUniform,
    setCurrentScale: setCurrentScale,
    uvToButtonIndex: uvToButtonIndex,
    touchActive: touchActive,
    shadowGroup: shadowGroup,
    clickScreen: clickScreen,
    setDamping: setDamping,
    getButton: getButton,
    armButton: armButton,
    render: render,
    arming: arming,
    clear: clear,
  });
}
ToneMatrix.prototype = Object.create(THREE.Object3D.prototype);

ToneMatrix.prototype.touch = function(raycaster) {
  var intersection = raycaster.intersectObject(this.clickScreen)[0];
  if (intersection && this.touchActive) {
    var address = this.uvToButtonIndex(intersection.uv);
    var touchedButton = this.getButton(address.x, address.y);
    if (this.arming === true && !touchedButton.isArmed()) {
      this.armButton(address.x, address.y);
    } else if (this.arming === false) {
      touchedButton.disarm();
    }
  }
};

ToneMatrix.prototype.touchStart = function(raycaster) {
  var intersection = raycaster.intersectObject(this.clickScreen)[0];
  if (intersection) {
    var address = this.uvToButtonIndex(intersection.uv);
    var touchedButton = this.getButton(address.x, address.y);
    this.arming = !touchedButton.isArmed();
    this.touchActive = true;
  }
  this.touch(raycaster);
};


ToneMatrix.prototype.touchEnd = function() {
  this.touchActive = false;
};

ToneMatrix.prototype.deactivateColumns = function(num) {
  this.setButtonUniform("u_activeColumn", -1);
};


ToneMatrix.prototype.mute = function(value) {
  this.setButtonUniform("u_muted", value);
};

ToneMatrix.prototype.setRippleTexture = function(texture) {
  this.setButtonUniform("u_rippleTex", texture);
};

ToneMatrix.prototype.activateColumn = function(num) {
  this.setButtonUniform("u_activeColumn", num);
};

export default ToneMatrix;
