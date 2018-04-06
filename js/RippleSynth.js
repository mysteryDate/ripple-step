import Tone from "../node_modules/Tone";

function RippleSynth(numVoices) {
  Tone.PolySynth.call(this, numVoices, Tone.MonoSynth);
  this.voices.forEach(function(voice) {
    voice.oscillator.type = "triangle";
  });
  this.toMaster();

  var envelope = {
    attack: this.voices[0].envelope.attack,
    decay: this.voices[0].envelope.decay,
    sustain: this.voices[0].envelope.sustain,
    release: this.voices[0].envelope.release,
  };

  var filter = {
    frequency: this.voices[0].filter.frequency.input.value,
    Q: this.voices[0].filter.Q.input.value,
  };

  this.getFilter = function(param) {
    return filter[param];
  };

  this.setFilter = function(param, value) {
    this.voices.forEach(function(voice) {
      voice.filter[param].input.value = value;
    });
    filter[param] = value;
  }.bind(this);

  this.getEnvelope = function(param) {
    return envelope[param];
  };

  this.setEnvelope = function(param, value) {
    this.voices.forEach(function(voice) {
      voice.envelope[param] = value;
    });
    envelope[param] = value;
  }.bind(this);

  var filterEnvelope = {
    attack: this.voices[0].filterEnvelope.attack,
    decay: this.voices[0].filterEnvelope.decay,
    sustain: this.voices[0].filterEnvelope.sustain,
    release: this.voices[0].filterEnvelope.release,
  };

  this.getFilterEnvelope = function(param) {
    return filterEnvelope[param];
  };

  this.setFilterEnvelope = function(param, value) {
    this.voices.forEach(function(voice) {
      voice.filterEnvelope[param] = value;
    });
    filterEnvelope[param] = value;
  }.bind(this);
}
RippleSynth.prototype = Object.create(Tone.PolySynth.prototype);

RippleSynth.prototype.setVolume = function(newVolume) {
  Tone.Master.volume.value = newVolume;
};

export default RippleSynth;
