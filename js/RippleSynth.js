import Tone from "../node_modules/Tone";

function RippleSynth(numVoices) {
  Tone.PolySynth.call(this, numVoices, Tone.Synth);
  this.toMaster();

  var envelope = {
    attack: this.voices[0].envelope.attack,
    decay: this.voices[0].envelope.decay,
    sustain: this.voices[0].envelope.sustain,
    release: this.voices[0].envelope.release,
  };

  this.getEnvelope = function(param) {
    return envelope[param];
  };

  this.setEnvelope = function(param, value) {
    this.voices.forEach(function(voice) {
      voice.envelope[param] = value;
    });
    envelope[param] = value;
  };
}
RippleSynth.prototype = Object.create(Tone.PolySynth.prototype);

RippleSynth.prototype.setVolume = function(v) {
  Tone.Master.volume.value = v;
};

export default RippleSynth;
