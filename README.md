# Ripple Step

A browser-based musical step sequencer with 3D WebGL visuals. Notes "ripple" outward from armed buttons in the matrix, triggering neighboring cells in a wave pattern.

## Getting Started

```bash
npm install
npm run dev:server
```

This starts webpack-dev-server at [http://localhost:8080/dev.html](http://localhost:8080/dev.html).

## Production Build

```bash
PRODUCTION=true npx webpack
```

Output goes to `dist/`.
