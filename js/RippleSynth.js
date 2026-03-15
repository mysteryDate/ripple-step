import Tone from "../node_modules/Tone/build/Tone.min.js";

function RippleSynth(numVoices, options) {
  Tone.PolySynth.call(this, numVoices, Tone.Synth);

  this.relative = (options.relative !== undefined) ? options.relative : false;
  this.scale = options.scale;
  this.voices.forEach(function(voice) {
    voice.oscillator.type = "triangle";
    voice.filter = new Tone.Filter(2000, "lowpass", -24);
    voice.oscillator.disconnect(voice.envelope);
    voice.oscillator.chain(voice.filter, voice.envelope);
  });

  var controls = {
    attack: {group: "envelope", value: this.voices[0].envelope.attack},
    decay: {group: "envelope", value: this.voices[0].envelope.decay},
    sustain: {group: "envelope", value: this.voices[0].envelope.sustain},
    release: {group: "envelope", value: this.voices[0].envelope.release},
    frequency: {group: "filter", value: this.voices[0].filter.frequency.input.value},
    Q: {group: "filter", value: this.voices[0].filter.Q.input.value},
    swing: {value: 0},
  };

  this.getControl = function(param) {
    return controls[param].value;
  };

  this.setControl = function(param, value) {
    this.voices.forEach(function(voice) {
      if (controls[param].group !== undefined) {
        if (voice[controls[param].group][param].input !== undefined) {
          voice[controls[param].group][param].input.value = value;
        } else {
          voice[controls[param].group][param] = value;
        }
      } else {
        controls[param].value = value;
      }
    });
    controls[param].value = value;
  }.bind(this);
}
RippleSynth.prototype = Object.create(Tone.PolySynth.prototype);

RippleSynth.prototype.setVolume = function(newVolume) {
  Tone.Master.volume.value = newVolume;
};

RippleSynth.prototype.start = function() {
  this.toMaster();
};

RippleSynth.prototype.playRow = function(row, scale) { // TODO relative
  var s = scale || this.scale;
  var note = s.notes[(row) % s.notes.length];
  var octave = Math.floor(row / s.notes.length) + 3;
  octave += s.octaves[(row) % s.notes.length];
  // Duration of an 8th note
  this.triggerAttackRelease(note + octave, "16n");
};

export default RippleSynth;
