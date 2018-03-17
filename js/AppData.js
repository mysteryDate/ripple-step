var Constants = {
  BASE_COLOR: 0x1d1e26,
  SECONDARY_BASE_COLOR: 0xaaaaaa,
  NUM_STEPS: 16,
  SPACING_RATIO: 1/10,
  STEP_VALUE: 1/8,
  RELATIVE: false,
  MUTE_COLOR_VALUE: 0.8,
};

var Controls = {
  TEMPO: 120,
  SWING: 0,
  NUM_NOTES_BEFORE_ENVELOPE_DISPLAY: 8,
};

Controls.Envelope = {
  knobs: [
    {
      control: "attack",
      minValue: 0.005,
      maxValue: 0.2,
      numLights: 16,
    },
    {
      control: "decay",
      minValue: 0.0,
      maxValue: 0.2,
      numLights: 20,
    },
    {
      control: "sustain",
      minValue: 0.0,
      maxValue: 1.0,
      numLights: 50,
    },
    {
      control: "release",
      minValue: 0.0,
      maxValue: 10.0,
      numLights: 100,
    },
  ],
};

var Scales = {
  "IV": {
    "relative_notes": ["C", "D", "F", "G", "A"],
    "relative_octaves": [0, 0, 0, 0, 0],
    "notes": ["F", "G", "A", "C", "D"],
    "octaves": [0, 0, 0, 1, 1],
    "color": 0xbf4944,
    "ripple_color": 0xff0000, // red
  },
  "I": {
    "notes": ["C", "D", "E", "G", "A"],
    "octaves": [0, 0, 0, 0, 0],
    "relative_notes": ["C", "D", "E", "G", "A"],
    "relative_octaves": [0, 0, 0, 0, 0],
    "color": 0xc3c045,
    "ripple_color": 0xffff00, // yellow
  },
  "V": {
    "relative_notes": ["B", "D", "F", "G", "A"],
    "relative_octaves": [-1, 0, 0, 0, 0],
    "notes": ["G", "A", "B", "D", "F"],
    "octaves": [-1, -1, -1, 0, 0],
    "color": 0x3bc34c,
    "ripple_color": 0x00ff00, // green
  },
  "ii": {
    "relative_notes": ["B", "D", "E", "F", "A"],
    "relative_octaves": [-1, 0, 0, 0, 0],
    "notes": ["D", "E", "F", "A", "B"],
    "octaves": [0, 0, 0, 0, 0],
    "color": 0x43a5bf,
    "ripple_color": 0x00ffff, // cyan
  },
  "vi": {
    "relative_notes": ["B", "C", "E", "F", "A"],
    "relative_octaves": [-1, 0, 0, 0, 0],
    "notes": ["A", "B", "C", "E", "F"],
    "octaves": [-1, -1, 0, 0, 0],
    "color": 0x5455b7,
    "ripple_color": 0x0000ff, // blue
  },
  "iii": {
    "relative_notes": ["B", "C", "E", "F", "G"],
    "relative_octaves": [-1, 0, 0, 0, 0],
    "notes": ["E", "F", "G", "B", "C"],
    "octaves": [0, 0, 0, 0, 1],
    "color": 0x8a49bd,
    "ripple_color": 0xff00ff, // magenta
  },
};

export {Constants, Scales, Controls};
