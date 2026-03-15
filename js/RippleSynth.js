var NOTE_SEMITONES = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11};

function noteToFrequency(noteName, octave) {
  var semitone = NOTE_SEMITONES[noteName];
  return 440 * Math.pow(2, (semitone - 9 + (octave - 4) * 12) / 12);
}

// Duration of a 16th note at 120 BPM
var NOTE_DURATION = 0.125;

// Tone.js 0.11 time-to-time-constant mapping:
//   getTimeConstant(t) = Math.log(t + 1) / Math.log(200)
// This maps parameter values to setTargetAtTime time constants.
// e.g. release=20 → tc=0.575s, release=1 → tc=0.131s
function toneTimeConstant(time) {
  return Math.log(time + 1) / Math.log(200);
}

// Minimum value for setTargetAtTime (matches Tone.js _minOutput)
var MIN_OUTPUT = 0.00001;

function RippleSynth(numVoices, options) {
  var ctx = options.audioContext;
  var masterGain = ctx.createGain();
  masterGain.gain.value = 1.0;
  masterGain.connect(ctx.destination);

  this.scale = options.scale;

  var controls = {
    attack: {value: 0.005},
    decay: {value: 0.1},
    sustain: {value: 0.3},
    release: {value: 1.0},
    frequency: {value: 2000},
    Q: {value: 1},
    swing: {value: 0},
  };

  // Track active nodes so knob changes apply to playing notes
  var activeFilters = [];
  var activeVoices = []; // {env, releaseStart, sustainLevel}

  this.getControl = function(param) {
    return controls[param].value;
  };

  this.setControl = function(param, value) {
    controls[param].value = value;
    if (param === "frequency" || param === "Q") {
      for (var i = 0; i < activeFilters.length; i++) {
        activeFilters[i][param].value = value;
      }
    }
    if (param === "release") {
      var now = ctx.currentTime;
      var tc = toneTimeConstant(value);
      for (var j = 0; j < activeVoices.length; j++) {
        var voice = activeVoices[j];
        voice.env.gain.cancelScheduledValues(
          Math.max(now, voice.releaseStart)
        );
        var anchorTime = Math.max(now, voice.releaseStart);
        var anchorVal = Math.max(voice.env.gain.value, MIN_OUTPUT);
        voice.env.gain.setValueAtTime(anchorVal, anchorTime);
        voice.env.gain.setTargetAtTime(MIN_OUTPUT, anchorTime, tc);
      }
    }
  };

  this.setVolume = function(db) {
    masterGain.gain.value = Math.pow(10, db / 20);
  };

  this.start = function() {
    // No-op — context is already running from user gesture
  };

  this.playRow = function(row, scale) {
    var s = scale || this.scale;
    var noteName = s.notes[row % s.notes.length];
    var octave = Math.floor(row / s.notes.length) + 3;
    octave += s.octaves[row % s.notes.length];
    var frequency = noteToFrequency(noteName, octave);

    var now = ctx.currentTime;
    var attack = controls.attack.value;
    var decay = controls.decay.value;
    var sustain = controls.sustain.value;
    var release = controls.release.value;

    // Oscillator
    var osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = frequency;

    // Two cascaded lowpass biquads for -24dB/oct rolloff
    var filter1 = ctx.createBiquadFilter();
    filter1.type = "lowpass";
    filter1.frequency.value = controls.frequency.value;
    filter1.Q.value = controls.Q.value;

    var filter2 = ctx.createBiquadFilter();
    filter2.type = "lowpass";
    filter2.frequency.value = controls.frequency.value;
    filter2.Q.value = controls.Q.value;

    // Envelope gain — matches Tone.js 0.11 Envelope exactly:
    //   Attack:  linearRampTo(1, attack)        → linearRampToValueAtTime
    //   Decay:   targetRampTo(sustain, decay)    → setTargetAtTime w/ toneTimeConstant
    //   Release: targetRampTo(0, release)        → setTargetAtTime w/ toneTimeConstant
    var env = ctx.createGain();
    var sustainLevel = Math.max(sustain, MIN_OUTPUT);
    var releaseStart = now + NOTE_DURATION;
    var decayTC = toneTimeConstant(decay);
    var releaseTC = toneTimeConstant(release);

    // Signal chain: osc → filter1 → filter2 → envelope → master
    osc.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(env);
    env.connect(masterGain);

    // Attack: anchor at 0, linear ramp to 1
    env.gain.setValueAtTime(MIN_OUTPUT, now);
    env.gain.linearRampToValueAtTime(1.0, now + attack);

    // Decay: setTargetAtTime approaching sustain
    env.gain.setTargetAtTime(sustainLevel, now + attack, decayTC);

    // Release: setTargetAtTime approaching 0
    // Cancel the decay curve at releaseStart, anchor, then release
    env.gain.cancelScheduledValues(releaseStart);
    env.gain.setValueAtTime(Math.max(sustainLevel, MIN_OUTPUT), releaseStart);
    env.gain.setTargetAtTime(MIN_OUTPUT, releaseStart, releaseTC);

    // Stop osc after release tail dies out (~5 time constants = 99.3%)
    var stopTime = releaseStart + releaseTC * 5 + 0.1;
    osc.start(now);
    osc.stop(stopTime);

    activeFilters.push(filter1, filter2);
    var voice = {env: env, releaseStart: releaseStart, sustainLevel: sustainLevel};
    activeVoices.push(voice);
    osc.onended = function() {
      osc.disconnect();
      filter1.disconnect();
      filter2.disconnect();
      env.disconnect();
      activeFilters.splice(activeFilters.indexOf(filter1), 1);
      activeFilters.splice(activeFilters.indexOf(filter2), 1);
      activeVoices.splice(activeVoices.indexOf(voice), 1);
    };
  };
}

export default RippleSynth;
