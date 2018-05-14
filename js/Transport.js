import {Constants, Controls} from "./AppData";

// TODO make this not terrible
function Transport() {
}

var previousPosition = Constants.NUM_STEPS - 1;
var numNotesPlayed = new Array(Constants.NUM_STEPS).fill(0); // Hacky activity monitor
Transport.prototype.update = function(timeSinceStart) {
  var beats = (timeSinceStart) / 1000 / 60 * Controls.TEMPO;
  var position = beats * (1/4 / Constants.STEP_VALUE);
  if (Math.floor(position) % 2 === 1) {
    position += window.app.synth.getControl("swing");
  }
  position = Math.floor(position % Constants.NUM_STEPS);

  if (position !== previousPosition) {
    window.app.toneMatrix.deactivateColumn(previousPosition);
    previousPosition = position;
    var rowsToPlay = window.app.toneMatrix.activateColumn(position, window.app.muted);
    if (!window.app.muted) {
      numNotesPlayed[position] = rowsToPlay.length;
      rowsToPlay.forEach(function(row) {
        window.app.synth.playRow(row);
      });
    }
  }

  // TODO
  // if (!window.app.knobPanel.visible) {
  //   var sum = 0;
  //   for (let i = 0; i < numNotesPlayed.length; i++) {
  //     sum += numNotesPlayed[i];
  //   }
  //   if (sum > Controls.NUM_NOTES_BEFORE_KNOBS_DISPLAY) {
  //     window.app.knobPanel.visible = true;
  //   }
  // }
};

export default Transport;
