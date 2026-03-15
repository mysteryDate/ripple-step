import {Group, Vector2, MathUtils} from "three";
import Knob from "./Knob";
import {Constants} from "./AppData";

function sizeAndPositionKnobs(knobGroup, width, height) {
  var numKnobs = knobGroup.children.length;
  var layout = (width > height) ? "horizontal" : "vertical";
  var knobRadius = Math.min(width/2, height/2/numKnobs);
  if (layout === "horizontal") {
    knobRadius = Math.min(width/2/numKnobs, height/2);
  }
  knobRadius = Math.min(knobRadius, Constants.MAX_KNOB_RADIUS);
  knobGroup.children.forEach(function(knob, i) {
    knob.position.set(0, 0, 0);
    knob.scale.set(knobRadius, knobRadius, 1);
    if (numKnobs > 1) {
      if (layout === "horizontal") {
        var panelWidth = 2 * knobRadius * numKnobs;
        knob.position.x = MathUtils.mapLinear(i, 0, numKnobs - 1, -panelWidth/2 + knobRadius, panelWidth/2 - knobRadius);
      } else {
        var panelHeight = 2 * knobRadius * numKnobs;
        knob.position.y = MathUtils.mapLinear(i, 0, numKnobs - 1, panelHeight/2 - knobRadius, -panelHeight/2 + knobRadius);
      }
    }
  });
}

function makeKnobs(knobOptions, getter, setter) {
  var knobGroup = new Group();
  var numKnobs = knobOptions.length;
  for (var i = 0; i < numKnobs; i++) {
    var knob = new Knob(Object.assign(knobOptions[i], {
      currentValue: knobOptions[i].initialValue || getter(knobOptions[i].control),
      sensitivity: 2 / window.devicePixelRatio,
    }));
    setter(knob.control, knob.getValue());
    knobGroup.add(knob);
  }
  return knobGroup;
}

class ControlPanel extends Group {
  constructor(options) {
    super();
    var knobOptions = options.knobs || [];

    var knobGroup = makeKnobs(knobOptions, options.getter, options.setter);
    this.add(knobGroup);

    this.touch = function(raycaster, event) {
      knobGroup.children.forEach(function(knob) {
        knob.touch(new Vector2(event.pageX, -event.pageY)); // TODO why redo this?
        options.setter(knob.control, knob.getValue());
      });
    };

    this.touchStart = function(raycaster, event) {
      knobGroup.children.forEach(function(knob) {
        knob.touchStart(raycaster, new Vector2(event.pageX, -event.pageY)); // TODO why redo this?
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

    this.resize = function(width, height) {
      sizeAndPositionKnobs(knobGroup, width, height);
    };
  }
}

export default ControlPanel;
