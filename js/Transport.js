import {Constants, Controls} from "./AppData";

// TODO make this not terrible
function Transport() {
  this.startTime = performance.now();
  this.paused = true;
  this.startPosition = Constants.NUM_STEPS - 1;
  this.previousPosition = Constants.NUM_STEPS - 1;
  this.position = this.previousPosition;

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

// TODO lots of law-of-demeter violations here
Transport.prototype.update = function() {
  if (this.paused) {
    window.app.toneMatrix.deactivateColumns();
    return;
  }
  var timeSinceStart = performance.now() - this.startTime;
  var beats = (timeSinceStart) / 1000 / 60 * Controls.TEMPO;
  this.position = beats * (1/4 / Constants.STEP_VALUE) + this.startPosition;
  if (Math.floor(this.position) % 2 === 1) {
    this.position += window.app.synth.getControl("swing");
  }
  this.position = Math.floor(this.position % Constants.NUM_STEPS);

  if (this.position !== this.previousPosition) {
    this.previousPosition = this.position;
    window.app.toneMatrix.activateColumn(this.position);
    var rowsToPlay = window.app.toneMatrix.getActiveNotesInColumn(this.position);
    if (!window.app.muted) {
      rowsToPlay.forEach(function(row) {
        window.app.synth.playRow(row);
      });
    }
  }
};

export default Transport;
