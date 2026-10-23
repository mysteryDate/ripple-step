import {
  Color, ShaderMaterial, InstancedBufferGeometry, BufferAttribute,
  InstancedBufferAttribute, DynamicDrawUsage, Mesh, Group, PlaneGeometry,
  MeshBasicMaterial, Vector2, Matrix3
} from "three";
import {Constants} from "./AppData"; // TODO pass in as options
import Materials from "./Materials";
import Rippleizer from "./Rippleizer";

var bgColor = new Color(Constants.BACKGROUND_COLOR);

// Each ripple buffer simulates one scale per RGB channel
var SCALES_PER_RIPPLE_BUFFER = 3;

// Columns are the ripple colours of the scales packed into one buffer
function makeRippleColorMatrix(rippleColors) {
  var columns = [0, 1, 2].map(function(channel) {
    return rippleColors[channel] || new Color(0x000000);
  });
  return new Matrix3().set(
    columns[0].r, columns[1].r, columns[2].r,
    columns[0].g, columns[1].g, columns[2].g,
    columns[0].b, columns[1].b, columns[2].b
  );
}

function makeKeyMaterial(options) {
  // Sampler arrays only accept constant indices, so the per-buffer lookups are unrolled here
  var rippleLookups = options.rippleColorMatrices.map(function(matrix, i) {
    return `rippleCol += u_rippleColors[${i}] * texture2D(u_rippleTex[${i}], rippleUv).rgb;`;
  }).join("\n");
  return new ShaderMaterial({
    uniforms: {
      u_numHorizontalNotes: {value: options.numHorizontalNotes},
      u_baseColor: {value: new Color(options.baseColor)},
      u_numVerticalNotes: {value: options.numVerticalNotes},
      u_rippleTex: {value: []},
      u_rippleColors: {value: options.rippleColorMatrices},
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
      #define NUM_RIPPLE_BUFFERS ${options.rippleColorMatrices.length}
      uniform sampler2D u_rippleTex[NUM_RIPPLE_BUFFERS];
      uniform mat3 u_rippleColors[NUM_RIPPLE_BUFFERS];
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

        vec2 rippleUv = (v_uv + v_relativePosition) / vec2(u_numHorizontalNotes, u_numVerticalNotes);
        vec3 rippleCol = vec3(0.0);
        ${rippleLookups}
        col += rippleCol * rippleCol;

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
      u_bufferIndex: {value: options.bufferIndex},
      u_muted: {value: false},
    },
    vertexShader: `
      attribute vec2 relativePosition;
      attribute float isArmed;
      attribute float isActive;
      attribute float scaleIndex;
      uniform float u_numHorizontalNotes;
      uniform float u_numVerticalNotes;
      varying vec2 v_relativePosition;
      varying float v_armed;
      varying float v_active;
      varying float v_scaleIndex;
      ${Materials.Include.map}
      void main() {
        v_armed = isArmed;
        v_active = isActive;
        v_relativePosition = relativePosition;
        v_scaleIndex = scaleIndex;
        vec2 offset = map(relativePosition, vec2(0.0), vec2(u_numHorizontalNotes, u_numVerticalNotes), vec2(0.0), vec2(1.0));
        vec3 pos = vec3(position.xy + offset - 0.5, 1.0); // Center it with -0.5
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float u_muted;
      uniform float u_bufferIndex;
      varying vec2 v_relativePosition;
      varying float v_armed;
      varying float v_active;
      varying float v_scaleIndex;
      #define MUTE_COLOR_VALUE ${Constants.MUTE_COLOR_VALUE.toFixed(3)}
      #define SCALES_PER_RIPPLE_BUFFER ${SCALES_PER_RIPPLE_BUFFER.toFixed(1)}
      void main() {
        float channel = v_scaleIndex - u_bufferIndex * SCALES_PER_RIPPLE_BUFFER;
        vec3 channelMask = 1.0 - step(0.5, abs(vec3(channel) - vec3(0.0, 1.0, 2.0)));
        vec3 col = mix(channelMask, channelMask * MUTE_COLOR_VALUE, u_muted);

        float opacity = v_active;

        gl_FragColor = vec4(col, opacity);
      }
    `,
  });
}

function MatrixButton(column, row, buttonIndex, armedBuffer, colorBuffer, scaleIndexBuffer) {
  this.column = column;
  this.row = row;
  this.scale = null;
  var armed = false;

  this.arm = function(color, scale, scaleIndex) {
    armed = true;
    armedBuffer.setX(buttonIndex, 1);
    armedBuffer.needsUpdate = true;
    if (color) {
      colorBuffer.setXYZ(buttonIndex, color.r, color.g, color.b);
      colorBuffer.needsUpdate = true;
    }
    scaleIndexBuffer.setX(buttonIndex, scaleIndex);
    scaleIndexBuffer.needsUpdate = true;
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
    var scaleIndexBuffer = new InstancedBufferAttribute(new Float32Array(numButtons), 1);
    var mutedBuffer = new InstancedBufferAttribute(new Float32Array(numButtons), 1);

    // Current scale state for newly armed buttons
    var currentButtonColor = new Color(0xffffff);
    var currentScale = null;

    var scaleList = Object.values(options.scales);
    var numRippleBuffers = Math.ceil(scaleList.length / SCALES_PER_RIPPLE_BUFFER);
    var rippleColorMatrices = [];
    for (var b = 0; b < numRippleBuffers; b++) {
      var bufferScales = scaleList.slice(b * SCALES_PER_RIPPLE_BUFFER, (b + 1) * SCALES_PER_RIPPLE_BUFFER);
      rippleColorMatrices.push(makeRippleColorMatrix(bufferScales.map(function(scale) {
        return new Color(scale.ripple_color);
      })));
    }
    var buttonIndex = 0;
    for (var col = 0; col < numHorizontalSteps; col++) {
      columns.push([]);
      for (var row = 0; row < numVerticalSteps; row++) {
        var button = new MatrixButton(col, row, buttonIndex, armedBuffer, colorBuffer, scaleIndexBuffer);
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
    scaleIndexBuffer.setUsage(DynamicDrawUsage);
    mutedBuffer.setUsage(DynamicDrawUsage);
    keyGeometry.setAttribute("relativePosition", relativePositions);
    keyGeometry.setAttribute("isArmed", armedBuffer);
    keyGeometry.setAttribute("isActive", activeBuffer);
    keyGeometry.setAttribute("buttonColor", colorBuffer);
    keyGeometry.setAttribute("scaleIndex", scaleIndexBuffer);
    keyGeometry.setAttribute("isMuted", mutedBuffer);
    var keyMaterial = makeKeyMaterial({
      numHorizontalNotes: numHorizontalSteps,
      numVerticalNotes: numVerticalSteps,
      baseColor: Constants.TONE_MATRIX_BACKGROUND,
      rippleColorMatrices: rippleColorMatrices,
    });
    this.add(new Mesh(keyGeometry, keyMaterial));

    // Because the instanced buffer geometries don't have true bounding boxes
    var clickScreen = new Mesh(new PlaneGeometry(), new MeshBasicMaterial({transparent: true, opacity: 0}));
    this.add(clickScreen);

    var shadowKeyMaterials = [];
    var rippleizers = [];
    for (var bufferIndex = 0; bufferIndex < numRippleBuffers; bufferIndex++) {
      var shadowKeyMaterial = makeShadowKeyMaterial({
        numHorizontalNotes: numHorizontalSteps,
        numVerticalNotes: numVerticalSteps,
        bufferIndex: bufferIndex,
      });
      var shadowGroup = new Group();
      shadowGroup.add(new Mesh(keyGeometry, shadowKeyMaterial));
      shadowGroup.add(clickScreen.clone()); // So that it has a proper BB
      shadowKeyMaterials.push(shadowKeyMaterial);
      rippleizers.push(new Rippleizer(shadowGroup, options));
    }
    var shadowDirty = true;

    function setButtonUniform(uniformName, value, shadowValue) {
      keyMaterial.uniforms[uniformName].value = value;
      if (shadowValue === undefined) shadowValue = value;
      shadowKeyMaterials.forEach(function(material) {
        if (material.uniforms[uniformName] !== undefined) {
          material.uniforms[uniformName].value = shadowValue;
        }
      });
    }

    function setCurrentScale(color, scale) {
      currentButtonColor = color;
      currentScale = scale;
    }

    function armButton(x, y) {
      columns[x][y].arm(currentButtonColor, currentScale, scaleList.indexOf(currentScale));
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

    function setDamping(scale, newDamping) {
      var scaleIndex = scaleList.indexOf(scale);
      var rippleizer = rippleizers[Math.floor(scaleIndex / SCALES_PER_RIPPLE_BUFFER)];
      rippleizer.damping.value.setComponent(scaleIndex % SCALES_PER_RIPPLE_BUFFER, newDamping);
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
      rippleizers.forEach(function(rippleizer) {
        rippleizer.render(renderer, shadowDirty);
      });
      shadowDirty = false;
      setButtonUniform("u_rippleTex", rippleizers.map(function(rippleizer) {
        return rippleizer.getActiveTexture();
      }));
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

export default ToneMatrix;
