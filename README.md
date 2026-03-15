# Ripple Step

A browser-based musical step sequencer with 3D WebGL visuals. Notes "ripple" outward from armed buttons in the matrix, triggering neighboring cells in a wave pattern.

## Getting Started

```bash
npm install
npm run dev:server
```

This starts webpack-dev-server at [http://localhost:8080](http://localhost:8080). The app is available at both `/index.html` (production entry) and `/dev.html` (testbed entry).

## Build & Deploy

The site is hosted on GitHub Pages from the `main` branch. The root `index.html` loads `dist/app.bundle.js` directly, so the built bundle is committed to the repo.

To build and deploy:

```bash
# 1. Build the production bundle
npm run build

# 2. Commit the updated bundle
git add dist/
git commit -m "Build for deploy"

# 3. Push to main (triggers GitHub Pages)
git push origin main
```

The `build` script runs webpack in production mode, outputting minified bundles to `dist/`.
