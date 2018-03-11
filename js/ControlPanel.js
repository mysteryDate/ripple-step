import * as THREE from "../node_modules/three";
import Knob from "./Knob";

function makeKnobs(width, height, knobOptions, getter) {
  var knobGroup = new THREE.Group();
  var numKnobs = knobOptions.length;
  console.log(width, height);
  var layout = (width > height) ? "horizontal" : "vertical";
  var knobRadius = Math.min(width/2, height/2/numKnobs);
  if (layout === "horizontal") {
    knobRadius = Math.min(width/2/numKnobs, height/2);
  }
  for (var i = 0; i < numKnobs; i++) {
    var knob = new Knob(Object.assign(knobOptions[i], {
      currentValue: getter(knobOptions[i].control),
      size: knobRadius,
      sensitivity: 2,
    }));
    knobGroup.add(knob);
    if (layout === "horizontal") {
      knob.position.x = knobRadius * (2 * i - 3);
    } else {
      knob.position.y = knobRadius * (3 - 2 * i);
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

  this.touch = function(raycaster) {
    knobGroup.children.forEach(function(knob) {
      knob.touch(new THREE.Vector2(event.clientX, -event.clientY));
      options.setter(knob.control, knob.getValue());
    });
  };

  this.touchStart = function(raycaster) {
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
}
ControlPanel.prototype = Object.create(THREE.Object3D.prototype);

export default ControlPanel;
