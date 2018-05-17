import {Constants, Controls} from "./AppData";

function Transport(options) {
  options = options || {};
  this.startTime = performance.now();
  this.paused = true;
  this.startPosition = Constants.NUM_STEPS - 1;
  this.previousPosition = Constants.NUM_STEPS - 1;
  this.position = this.previousPosition;
  this.distanceFromBeat = 0;
  this.swing = (options.swing !== undefined) ? 0 : options.swing;

  this.start = function() {
    this.startTime = performance.now();
    this.paused = false;
  };

  this.togglePaused = function() {
    if (!this.paused) {
      this.startPosition = this.position;
      this.previousPosition = this.position;
      this.paused = true;
    } else {
      this.start();
    }
  };
}

Transport.prototype.update = function(beatCallback) {
  if (this.paused) {
    return;
  }
  var secondsSinceStart = (performance.now() - this.startTime) / 1000;
  var numBeatsPassed = Controls.TEMPO * secondsSinceStart / 60;
  var floatPosition = numBeatsPassed * (1/4 / Constants.STEP_VALUE) + this.startPosition;
  if (Math.floor(floatPosition) % 2 === 1) {
    floatPosition += this.swing;
  }
  var normalizedFloatPosition = floatPosition % Constants.NUM_STEPS;
  this.position = Math.floor(normalizedFloatPosition);
  this.distanceFromBeat = normalizedFloatPosition - this.position;

  if (this.position !== this.previousPosition) {
    this.previousPosition = this.position;
    beatCallback();
  }
};

export default Transport;
