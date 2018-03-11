import * as THREE from "../node_modules/three";
import Knob from "./Knob";
import {Constants} from "./AppData";

function makeKnobs(width, height, knobOptions) {
  var knobGroup = new THREE.Group();
  var numKnobs = knobOptions.length;
  // var knobRadius = Math.min(availableSpace/2 * 0.7, 0.5 * height/numKnobs * 0.8);
  var knobRadius = Math.min(width/2, height/2 / numKnobs);
  for (var i = 0; i < numKnobs; i++) {
    var knob = new Knob(Object.assign(knobOptions[i], {
      // currentValue: synth.getEnvelope(knobOptions[i].control),
      size: knobRadius,
      sensitivity: 2,
    }));
    knobGroup.add(knob);
    if (Controls.Envelope.position === "right" || Controls.Envelope.position === "left") {
      knob.position.y = knobRadius * (3 - 2 * i); // Vertical layout
    } else {
      knob.position.x = knobRadius * (3 - 2 * i); // Horizontal layout
    }
  }
  return knobGroup;
}

function ControlPanel(options) {
  THREE.Group.call(this);
  var width = options.width || 100;
  var height = options.height || 100;
  var knobOpitions = options.knobs || [];

  var knobGroup = makeKnobs(width, height, knobOpitions);

  switch (Controls.Envelope.position) {
    case "left":
      knobGroup.position.x = (width/2 - toneMatrixSize/2) / 2;
      knobGroup.position.y = height/2;
      break;
    case "right":
      knobGroup.position.x = (3 * width + toneMatrixSize) / 4;
      knobGroup.position.y = height/2;
      break;
    case "top":
      knobGroup.position.x = width/2;
      knobGroup.position.y = (3 * height + toneMatrixSize) / 4;
      break;
    case "bottom":
      knobGroup.position.x = width/2;
      knobGroup.position.y = (height/2 - toneMatrixSize/2) / 2;
      break;
    default:
      throw new Error("unknown position: " + Controls.Envelope.position);
  }

  this.touch = function(raycaster) {
    knobGroup.children.forEach(function(knob) {
      knob.touch(new THREE.Vector2(event.clientX, -event.clientY));
      // synth.setEnvelope(knob.control, knob.getValue());
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
}
ControlPanel.prototype = Object.create(THREE.Object3D.prototype);

export default ControlPanel;
