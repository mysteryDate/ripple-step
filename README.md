# Ripple Step

A browser-based musical step sequencer with 3D WebGL visuals. Notes "ripple" outward from armed buttons in the matrix, triggering neighboring cells in a wave pattern.

## Getting Started

```bash
npm install
npm run dev:server
```

This starts webpack-dev-server at [http://localhost:8080](http://localhost:8080). The app is available at both `/index.html` (production entry) and `/dev.html` (testbed entry).

## Mobile Device Testing

To access the dev server from a mobile device on the same Wi-Fi network:

1. Start the dev server with `--host 0.0.0.0` so it listens on all interfaces:
   ```bash
   npx webpack-dev-server --host 0.0.0.0
   ```
2. Find your local IP address:
   ```bash
   ipconfig   # Windows — look for "IPv4 Address" under your Wi-Fi adapter
   ```
3. On your phone's browser, go to `http://<your-ip>:8080`

If it doesn't connect, you may need to allow port 8080 through Windows Firewall.

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

## Query Parameters

| Parameter | Description |
|---|---|
| `?skipGate` | Skip the "Sound On" interaction gate (useful during development) |
| `?fps` | Show an FPS counter in the top-left corner |
| `?hiRes` | Use high-resolution ripple simulation with half-float precision, higher-res backing textures, and double-speed ping-pong buffering. Sharper waves that persist longer, but more GPU-intensive. Default is the lo-res 8-bit simulation which has a cleaner, more stylized look. |

Parameters can be combined: `http://localhost:8080/?skipGate&fps&hiRes`
