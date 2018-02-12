var Constants = {
  MATRIX_KEY_SIZE: 40,
  BASE_COLOR: 0x54576b,
  NUM_STEPS: 16,
  KEY_SIZE: 40,
  SPACING_RATIO: 1/10,
  TEMPO: 120,
  STEP_VALUE: 1/8,
  SWING: 0,
};

Constants.Scales = {
  "IV": {
    "relative_notes": ["C", "D", "F", "G", "A"],
    "relative_octaves": [0, 0, 0, 0, 0],
    "notes": ["F", "G", "A", "C", "D"],
    "octaves": [0, 0, 0, 1, 1],
    "color": 0xbf4944,
  },
  "I": {
    "notes": ["C", "D", "E", "G", "A"],
    "octaves": [0, 0, 0, 0, 0],
    "relative_notes": ["C", "D", "E", "G", "A"],
    "relative_octaves": [0, 0, 0, 0, 0],
    "color": 0xc3c045,
  },
  "V": {
    "relative_notes": ["B", "D", "F", "G", "A"],
    "relative_octaves": [-1, 0, 0, 0, 0],
    "notes": ["G", "A", "B", "D", "F"],
    "octaves": [-1, -1, -1, 0, 0],
    "color": 0xc08032,
  },
  "ii": {
    "relative_notes": ["B", "D", "E", "F", "A"],
    "relative_octaves": [-1, 0, 0, 0, 0],
    "notes": ["D", "E", "F", "A", "B"],
    "octaves": [0, 0, 0, 0, 0],
    "color": 0x6bbc5a,
  },
  "vi": {
    "relative_notes": ["B", "C", "E", "F", "A"],
    "relative_octaves": [-1, 0, 0, 0, 0],
    "notes": ["A", "B", "C", "E", "F"],
    "octaves": [-1, -1, 0, 0, 0],
    "color": 0x5455b7,
  },
  "iii": {
    "relative_notes": ["B", "C", "E", "F", "G"],
    "relative_octaves": [-1, 0, 0, 0, 0],
    "notes": ["E", "F", "G", "B", "C"],
    "octaves": [0, 0, 0, 0, 1],
    "color": 0x8a49bd,
  },
};

export default Constants;
