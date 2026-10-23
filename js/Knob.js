import {
  Group, CircleGeometry, MeshBasicMaterial, Mesh, InstancedBufferGeometry,
  BufferAttribute, InstancedBufferAttribute, Vector2, Color, MathUtils,
  PlaneGeometry, CanvasTexture
} from "three";
import Materials from "./Materials";
import {Constants} from "./AppData";

// Icons are SVG path strings drawn in a 24x24 viewBox
const ICON_VIEWBOX_SIZE = 24;
const ICON_STROKE_WIDTH = 2;
const ICON_TEXTURE_SIZE = 128;

function makeIconTexture(iconPaths) {
  var canvas = document.createElement("canvas");
  canvas.width = ICON_TEXTURE_SIZE;
  canvas.height = ICON_TEXTURE_SIZE;
  var context = canvas.getContext("2d");
  context.scale(ICON_TEXTURE_SIZE / ICON_VIEWBOX_SIZE, ICON_TEXTURE_SIZE / ICON_VIEWBOX_SIZE);
  context.strokeStyle = "white";
  context.lineWidth = ICON_STROKE_WIDTH;
  context.lineCap = "round";
  context.lineJoin = "round";
  iconPaths.forEach(function(pathData) {
    context.stroke(new Path2D(pathData));
  });
  return new CanvasTexture(canvas);
}

class Knob extends Group {
  constructor(options) {
    super();
    const NUM_CIRCLE_SEGMENTS = 100; // How smooth is the circle
    const INDICATOR_LIGHT_DISTANCE_RATIO = 1.25; // distance of indicator lights relative to radius
    const INDICATOR_LIGHT_SIZE_RATIO = 0.2; // radius of lights relative to knob radius
    const ICON_SIZE_RATIO = 1.0; // icon width relative to knob radius
    const ICON_DEPTH_OFFSET = 0.01;

    options = options || {};
    var sensitivity = options.sensitivity || 1; // How many degrees the knob turns per pixel
    var minRotation = options.minRotation || -0.75 * Math.PI;
    var maxRotation = options.maxRotation || 0.75 * Math.PI;
    var minValue = options.minValue || 0;
    var maxValue = options.maxValue || 100;
    var currentValue = options.currentValue || minValue;
    var numLights = options.numLights || 16;
    this.control = options.control;

    var isActive = false;
    var touchStartRotation = 0;
    var touchStartPos = new Vector2();

    var radius = 1 / (INDICATOR_LIGHT_DISTANCE_RATIO + INDICATOR_LIGHT_SIZE_RATIO);
    var bodyGeom = new CircleGeometry(radius, NUM_CIRCLE_SEGMENTS);
    var bodyMat = new MeshBasicMaterial({color: Constants.BASE_COLOR});
    var body = new Mesh(bodyGeom, bodyMat);
    this.add(body);

    var nib = new Mesh(bodyGeom, new MeshBasicMaterial({color: Constants.SECONDARY_BASE_COLOR}));
    nib.scale.multiplyScalar(0.1);
    body.add(nib);
    nib.position.y += radius * 0.8;

    // Multiple icons are spread evenly across the value range and crossfade between neighbours
    var icons = (options.icons || (options.icon ? [options.icon] : [])).map(function(iconPaths) {
      var iconMat = new MeshBasicMaterial({map: makeIconTexture(iconPaths), transparent: true});
      var icon = new Mesh(new PlaneGeometry(1, 1), iconMat);
      icon.scale.setScalar(ICON_SIZE_RATIO * radius);
      icon.position.z = ICON_DEPTH_OFFSET;
      return icon;
    });
    icons.forEach(function(icon) {
      this.add(icon);
    }, this);
    function updateIconOpacities(value) {
      var iconPosition = MathUtils.mapLinear(value, minValue, maxValue, 0, icons.length - 1);
      icons.forEach(function(icon, i) {
        icon.material.opacity = Math.max(0, 1 - Math.abs(iconPosition - i));
      });
    }
    updateIconOpacities(currentValue);

    var lights = (function makeLights() {
      var icRadius = INDICATOR_LIGHT_SIZE_RATIO * radius;
      var positions = [0, 2 * icRadius, 0, 2 * icRadius, 2 * icRadius, 0, 0, 0, 0, 2 * icRadius, 0, 0];
      var indices = [0, 2, 1, 2, 3, 1];
      var uvs = [0, 1, 1, 1, 0, 0, 1, 0];
      var geom = new InstancedBufferGeometry();
      geom.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
      geom.translate(-icRadius, -icRadius, 0);
      geom.setIndex(indices);
      geom.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
      var relativePositions = new InstancedBufferAttribute(new Float32Array(numLights * 3), 3);
      var angles = new InstancedBufferAttribute(new Float32Array(numLights), 1);

      for (let i = 0; i < numLights; i++) {
        var rot = MathUtils.mapLinear(i, 0, numLights - 1, minRotation, maxRotation);
        // Our rotations start pointing up and have positive values going clockwise
        // Yes, this is absurd, stop waving your arms
        rot = -rot + Math.PI/2;
        var x = INDICATOR_LIGHT_DISTANCE_RATIO * radius * Math.cos(rot);
        var y = INDICATOR_LIGHT_DISTANCE_RATIO * radius * Math.sin(rot);
        relativePositions.setXYZ(i, x, y, 0);
        angles.setX(i, rot);
      }
      geom.setAttribute("relativePosition", relativePositions);
      geom.setAttribute("angle", angles);
      var instancedMesh = new Mesh(geom, Materials.indicatorLight());
      return instancedMesh;
    })();
    this.add(lights);

    function setRotation(rotation) {
      // This is necessary because values are counter clockwise
      body.rotation.z = -rotation;
      // same regrettable transformation as above
      lights.material.uniforms.u_currentRotation.value = -rotation + Math.PI/2;
    }
    function getRotationFromValue(value) {
      return MathUtils.mapLinear(value, minValue, maxValue, minRotation, maxRotation);
    }
    function getValueFromRotation(rotation) {
      return MathUtils.mapLinear(rotation, minRotation, maxRotation, minValue, maxValue);
    }

    setRotation(getRotationFromValue(currentValue));

    this.getValue = function() {
      return currentValue;
    };

    this.touchStart = function(raycaster, mouse) {
      var touch = raycaster.intersectObjects(this.children)[0];
      if (touch) {
        isActive = true;
        touchStartPos = mouse;
        touchStartRotation = -body.rotation.z;
      }
    };

    this.touchEnd = function() {
      isActive = false;
    };

    var touchDiff = new Vector2();
    this.touch = function(mouse) {
      if (isActive) {
        touchDiff.subVectors(mouse, touchStartPos);
        var touchStrength = touchDiff.x + touchDiff.y;
        var newRotation = touchStartRotation + MathUtils.degToRad(sensitivity * touchStrength);
        newRotation = MathUtils.clamp(newRotation, minRotation, maxRotation);
        setRotation(newRotation);
        currentValue = getValueFromRotation(newRotation);
        updateIconOpacities(currentValue);
      }
    };

    this.setColor = function(color) {
      lights.material.uniforms.u_color.value = new Color(color); // TODO come in as a three.color?
      icons.forEach(function(icon) {
        icon.material.color.set(color);
      });
    };
  }
}

export default Knob;
