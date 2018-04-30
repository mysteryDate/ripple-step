import * as THREE from "../node_modules/three";
import Knob from "./Knob";

var KNOB_SPACING = 0.1;

function makeKnobs(width, height, knobOptions, getter, setter) {
  var knobGroup = new THREE.Group();
  var numKnobs = knobOptions.length;
  var layout = (width > height) ? "horizontal" : "vertical";
  var knobRadius = Math.min(width/2, height/2/numKnobs);
  if (layout === "horizontal") {
    knobRadius = Math.min(width/2/numKnobs, height/2);
  }
  for (var i = 0; i < numKnobs; i++) {
    var knob = new Knob(Object.assign(knobOptions[i], {
      currentValue: knobOptions[i].initialValue || getter(knobOptions[i].control),
      sensitivity: 2,
    }));
    knob.scale.set(knobRadius, knobRadius, 1);
    knobGroup.add(knob);
    if (numKnobs > 1) {
      if (layout === "horizontal") {
        var panelWidth = 2 * knobRadius * numKnobs * (1 + KNOB_SPACING);
        knob.position.x = THREE.Math.mapLinear(i, 0, numKnobs - 1, -panelWidth/2 + knobRadius, panelWidth/2 - knobRadius);
      } else {
        var panelHeight = 2 * knobRadius * numKnobs * (1 + KNOB_SPACING);
        knob.position.y = THREE.Math.mapLinear(i, 0, numKnobs - 1, panelHeight/2 - knobRadius, -panelHeight/2 + knobRadius);
      }
    }
  }
  return knobGroup;
}

function ControlPanel(options) {
  THREE.Group.call(this);
  var width = options.width || 100;
  var height = options.height || 100;
  var knobOptions = options.knobs || [];

  var knobGroup = makeKnobs(width, height, knobOptions, options.getter);
  this.add(knobGroup);

  this.touch = function(raycaster, event) {
    knobGroup.children.forEach(function(knob) {
      knob.touch(new THREE.Vector2(event.clientX, -event.clientY));
      options.setter(knob.control, knob.getValue());
    });
  };

  this.touchStart = function(raycaster, event) {
    knobGroup.children.forEach(function(knob) {
      knob.touchStart(raycaster, new THREE.Vector2(event.clientX, -event.clientY));
    });
  };

  this.touchEnd = function(raycaster) {
    knobGroup.children.forEach(function(knob) {
      knob.touchEnd();
    });
  };

  this.setColor = function(color) {
    knobGroup.children.forEach(function(knob) {
      knob.setColor(color);
    });
  };

  var helper;
  this.resize = function(newWidth, newHeight) {
    var numKnobs = knobGroup.children.length;
    var layout = (newWidth > newHeight) ? "horizontal" : "vertical";
    var knobRadius = Math.min(newWidth/2, newHeight/2/numKnobs);
    if (layout === "horizontal") {
      knobRadius = Math.min(newWidth/2/numKnobs, newHeight/2);
    }
    knobGroup.children.forEach(function(knob, i) {
      knob.position.set(0, 0, 0);
      knob.scale.set(knobRadius, knobRadius, 1);
      if (layout === "horizontal") {
        var panelWidth = 2 * knobRadius * numKnobs * (1 + KNOB_SPACING);
        knob.position.x = THREE.Math.mapLinear(i, 0, numKnobs - 1, -panelWidth/2 + knobRadius, panelWidth/2 - knobRadius);
      } else {
        var panelHeight = 2 * knobRadius * numKnobs * (1 + KNOB_SPACING);
        knob.position.y = THREE.Math.mapLinear(i, 0, numKnobs - 1, panelHeight/2 - knobRadius, -panelHeight/2 + knobRadius);
      }
    });
    this.remove(helper);
    helper = new THREE.Mesh(new THREE.PlaneBufferGeometry(newWidth, newHeight), new THREE.MeshBasicMaterial({color: "pink", wireframe: true}));
    this.add(helper);
  };
}
ControlPanel.prototype = Object.create(THREE.Object3D.prototype);

export default ControlPanel;
