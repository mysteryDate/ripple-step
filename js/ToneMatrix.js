import {
  Color, ShaderMaterial, InstancedBufferGeometry, BufferAttribute,
  InstancedBufferAttribute, DynamicDrawUsage, Mesh, Group, PlaneGeometry,
  MeshBasicMaterial, Vector2
} from "three";
import {Constants} from "./AppData"; // TODO pass in as options
import Materials from "./Materials";
import Rippleizer from "./Rippleizer";

var bgColor = new Color(Constants.BACKGROUND_COLOR);

function makeKeyMaterial(options) {
  return new ShaderMaterial({
    uniforms: {
      u_numHorizontalNotes: {value: options.numHorizontalNotes},
      u_baseColor: {value: new Color(options.baseColor)},
      u_numVerticalNotes: {value: options.numVerticalNotes},
      u_rippleTex: {value: null},
      u_muted: {value: false},
    },
    vertexShader: `
      attribute vec2 relativePosition;
      attribute float isArmed;
      attribute float isActive;
      attribute float isMuted;
      attribute vec3 buttonColor;
      uniform float u_numHorizontalNotes;
      uniform float u_numVerticalNotes;
      varying vec2 v_relativePosition;
      varying vec2 v_uv;
      varying float v_armed;
      varying float v_active;
      varying float v_muted;
      varying vec3 v_buttonColor;
      ${Materials.Include.map}
      void main() {
        v_uv = uv;
        v_armed = isArmed;
        v_active = isActive;
        v_muted = isMuted;
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
      uniform float u_muted;
      varying vec2 v_relativePosition;
      varying vec2 v_uv;
      varying float v_armed;
      varying float v_active;
      varying float v_muted;
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
        float effectiveArmed = v_armed * (1.0 - v_muted * 0.6);
        col = mix(u_baseColor, col, effectiveArmed);
        col = mix(col, vec3(1.0), v_active);

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
  return new ShaderMaterial({
    transparent: true,
    uniforms: {
      u_numHorizontalNotes: {value: options.numHorizontalNotes},
      u_numVerticalNotes: {value: options.numVerticalNotes},
      u_muted: {value: false},
    },
    vertexShader: `
      attribute vec2 relativePosition;
      attribute float isArmed;
      attribute float isActive;
      attribute vec3 buttonShadowColor;
      uniform float u_numHorizontalNotes;
      uniform float u_numVerticalNotes;
      varying vec2 v_relativePosition;
      varying float v_armed;
      varying float v_active;
      varying vec3 v_shadowColor;
      ${Materials.Include.map}
      void main() {
        v_armed = isArmed;
        v_active = isActive;
        v_relativePosition = relativePosition;
        v_shadowColor = buttonShadowColor;
        vec2 offset = map(relativePosition, vec2(0.0), vec2(u_numHorizontalNotes, u_numVerticalNotes), vec2(0.0), vec2(1.0));
        vec3 pos = vec3(position.xy + offset - 0.5, 1.0); // Center it with -0.5
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float u_muted;
      varying vec2 v_relativePosition;
      varying float v_armed;
      varying float v_active;
      varying vec3 v_shadowColor;
      #define MUTE_COLOR_VALUE ${Constants.MUTE_COLOR_VALUE.toFixed(3)}
      void main() {
        vec3 col = mix(v_shadowColor, v_shadowColor * MUTE_COLOR_VALUE, u_muted);

        float opacity = v_active;

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

class ToneMatrix extends Group {
  constructor(numHorizontalSteps, numVerticalSteps, options) {
    super();
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

      var g = new InstancedBufferGeometry();
      g.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
      g.setIndex(indices);
      g.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
      return g;
    })();
    var buttons = [];
    var columns = [];
    var numButtons = numHorizontalSteps * numVerticalSteps;
    var relativePositions = new InstancedBufferAttribute(new Float32Array(numButtons * 2), 2);
    var armedBuffer = new InstancedBufferAttribute(new Float32Array(numButtons), 1); // 0 = inactive, 1 = armed
    var activeBuffer = new InstancedBufferAttribute(new Float32Array(numButtons), 1); // 0 = inactive, 1 = playing
    var colorBuffer = new InstancedBufferAttribute(new Float32Array(numButtons * 3), 3);
    var shadowColorBuffer = new InstancedBufferAttribute(new Float32Array(numButtons * 3), 3);
    var mutedBuffer = new InstancedBufferAttribute(new Float32Array(numButtons), 1);

    // Current scale state for newly armed buttons
    var currentButtonColor = new Color(0xffffff);
    var currentShadowColor = new Color(0xffffff);
    var currentScale = null;

    var shadowGroup = new Group();
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
    armedBuffer.setUsage(DynamicDrawUsage);
    activeBuffer.setUsage(DynamicDrawUsage);
    colorBuffer.setUsage(DynamicDrawUsage);
    shadowColorBuffer.setUsage(DynamicDrawUsage);
    mutedBuffer.setUsage(DynamicDrawUsage);
    keyGeometry.setAttribute("relativePosition", relativePositions);
    keyGeometry.setAttribute("isArmed", armedBuffer);
    keyGeometry.setAttribute("isActive", activeBuffer);
    keyGeometry.setAttribute("buttonColor", colorBuffer);
    keyGeometry.setAttribute("buttonShadowColor", shadowColorBuffer);
    keyGeometry.setAttribute("isMuted", mutedBuffer);
    var keyMaterial = makeKeyMaterial({
      numHorizontalNotes: numHorizontalSteps,
      numVerticalNotes: numVerticalSteps,
      baseColor: Constants.TONE_MATRIX_BACKGROUND,
    });
    this.add(new Mesh(keyGeometry, keyMaterial));

    // Because the instanced buffer geometries don't have true bounding boxes
    var clickScreen = new Mesh(new PlaneGeometry(), new MeshBasicMaterial({transparent: true, opacity: 0}));
    this.add(clickScreen);

    var shadowKeyMaterial = makeShadowKeyMaterial({numHorizontalNotes: numHorizontalSteps, numVerticalNotes: numVerticalSteps});
    shadowGroup.add(new Mesh(keyGeometry, shadowKeyMaterial));
    shadowGroup.add(clickScreen.clone()); // So that it has a proper BB
    var rippleizer = new Rippleizer(shadowGroup, options);
    var shadowDirty = true;

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

    var _uvResult = new Vector2();
    function uvToButtonIndex(uv) {
      _uvResult.set(
        Math.floor(uv.x * numHorizontalSteps),
        Math.floor(uv.y * numVerticalSteps)
      );
      return _uvResult;
    }

    function setDamping(newDamping) {
      rippleizer.damping.value = newDamping;
    }

    // Set per-button active state based on each scale's transport position
    // scaleColumnMap: Map<scaleObject, columnPosition>
    function activateByScale(scaleColumnMap) {
      var changed = false;
      for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        var active = 0;
        if (btn.isArmed() && btn.scale && scaleColumnMap.has(btn.scale)) {
          if (scaleColumnMap.get(btn.scale) === btn.column) {
            active = 1;
          }
        }
        if (activeBuffer.getX(i) !== active) {
          activeBuffer.setX(i, active);
          changed = true;
        }
      }
      if (changed) {
        activeBuffer.needsUpdate = true;
        shadowDirty = true;
      }
    }

    function deactivateAll() {
      var changed = false;
      for (var i = 0; i < buttons.length; i++) {
        if (activeBuffer.getX(i) !== 0) {
          activeBuffer.setX(i, 0);
          changed = true;
        }
      }
      if (changed) {
        activeBuffer.needsUpdate = true;
        shadowDirty = true;
      }
    }

    function setMutedScales(mutedSet) {
      var changed = false;
      for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        var m = (btn.isArmed() && btn.scale && mutedSet.has(btn.scale)) ? 1 : 0;
        if (mutedBuffer.getX(i) !== m) {
          mutedBuffer.setX(i, m);
          changed = true;
        }
      }
      if (changed) {
        mutedBuffer.needsUpdate = true;
      }
    }

    function render(renderer) {
      rippleizer.render(renderer, shadowDirty);
      shadowDirty = false;
      setButtonUniform("u_rippleTex", rippleizer.getActiveTexture());
    }

    Object.assign(this, {
      getActiveNotesInColumn: getActiveNotesInColumn,
      setButtonUniform: setButtonUniform,
      setCurrentScale: setCurrentScale,
      activateByScale: activateByScale,
      setMutedScales: setMutedScales,
      uvToButtonIndex: uvToButtonIndex,
      deactivateAll: deactivateAll,
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
}

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

ToneMatrix.prototype.deactivateColumns = function() {
  this.deactivateAll();
};


ToneMatrix.prototype.mute = function(value) {
  this.setButtonUniform("u_muted", value);
};

ToneMatrix.prototype.setRippleTexture = function(texture) {
  this.setButtonUniform("u_rippleTex", texture);
};

export default ToneMatrix;
