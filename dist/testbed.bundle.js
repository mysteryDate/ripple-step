var RS =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return Constants; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"c\", function() { return Scales; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"b\", function() { return Controls; });\nvar Constants = {\n  MATRIX_KEY_SIZE: 40,\n  BASE_COLOR: 0x3a3c4c,\n  NUM_STEPS: 16,\n  SPACING_RATIO: 1/10,\n  STEP_VALUE: 1/8,\n  RELATIVE: false,\n};\n\nvar Controls = {\n  TEMPO: 120,\n  SWING: 0,\n};\n\nvar Scales = {\n  \"IV\": {\n    \"relative_notes\": [\"C\", \"D\", \"F\", \"G\", \"A\"],\n    \"relative_octaves\": [0, 0, 0, 0, 0],\n    \"notes\": [\"F\", \"G\", \"A\", \"C\", \"D\"],\n    \"octaves\": [0, 0, 0, 1, 1],\n    \"color\": 0xbf4944, // Mostly red\n    \"ripple_color\": 0xff0000,\n  },\n  \"I\": {\n    \"notes\": [\"C\", \"D\", \"E\", \"G\", \"A\"],\n    \"octaves\": [0, 0, 0, 0, 0],\n    \"relative_notes\": [\"C\", \"D\", \"E\", \"G\", \"A\"],\n    \"relative_octaves\": [0, 0, 0, 0, 0],\n    \"color\": 0xc3c045,\n    \"ripple_color\": 0xffff00,\n  },\n  \"V\": {\n    \"relative_notes\": [\"B\", \"D\", \"F\", \"G\", \"A\"],\n    \"relative_octaves\": [-1, 0, 0, 0, 0],\n    \"notes\": [\"G\", \"A\", \"B\", \"D\", \"F\"],\n    \"octaves\": [-1, -1, -1, 0, 0],\n    \"color\": 0xc08032,\n    \"ripple_color\": 0x00ff00,\n  },\n  \"ii\": {\n    \"relative_notes\": [\"B\", \"D\", \"E\", \"F\", \"A\"],\n    \"relative_octaves\": [-1, 0, 0, 0, 0],\n    \"notes\": [\"D\", \"E\", \"F\", \"A\", \"B\"],\n    \"octaves\": [0, 0, 0, 0, 0],\n    \"color\": 0x6bbc5a,\n    \"ripple_color\": 0x00ffff,\n  },\n  \"vi\": {\n    \"relative_notes\": [\"B\", \"C\", \"E\", \"F\", \"A\"],\n    \"relative_octaves\": [-1, 0, 0, 0, 0],\n    \"notes\": [\"A\", \"B\", \"C\", \"E\", \"F\"],\n    \"octaves\": [-1, -1, 0, 0, 0],\n    \"color\": 0x5455b7,\n    \"ripple_color\": 0x0000ff,\n  },\n  \"iii\": {\n    \"relative_notes\": [\"B\", \"C\", \"E\", \"F\", \"G\"],\n    \"relative_octaves\": [-1, 0, 0, 0, 0],\n    \"notes\": [\"E\", \"F\", \"G\", \"B\", \"C\"],\n    \"octaves\": [0, 0, 0, 0, 1],\n    \"color\": 0x8a49bd,\n    \"ripple_color\": 0xff00ff,\n  },\n};\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL2pzL0FwcERhdGEuanM/NjYxYiJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQ29uc3RhbnRzID0ge1xuICBNQVRSSVhfS0VZX1NJWkU6IDQwLFxuICBCQVNFX0NPTE9SOiAweDNhM2M0YyxcbiAgTlVNX1NURVBTOiAxNixcbiAgU1BBQ0lOR19SQVRJTzogMS8xMCxcbiAgU1RFUF9WQUxVRTogMS84LFxuICBSRUxBVElWRTogZmFsc2UsXG59O1xuXG52YXIgQ29udHJvbHMgPSB7XG4gIFRFTVBPOiAxMjAsXG4gIFNXSU5HOiAwLFxufTtcblxudmFyIFNjYWxlcyA9IHtcbiAgXCJJVlwiOiB7XG4gICAgXCJyZWxhdGl2ZV9ub3Rlc1wiOiBbXCJDXCIsIFwiRFwiLCBcIkZcIiwgXCJHXCIsIFwiQVwiXSxcbiAgICBcInJlbGF0aXZlX29jdGF2ZXNcIjogWzAsIDAsIDAsIDAsIDBdLFxuICAgIFwibm90ZXNcIjogW1wiRlwiLCBcIkdcIiwgXCJBXCIsIFwiQ1wiLCBcIkRcIl0sXG4gICAgXCJvY3RhdmVzXCI6IFswLCAwLCAwLCAxLCAxXSxcbiAgICBcImNvbG9yXCI6IDB4YmY0OTQ0LCAvLyBNb3N0bHkgcmVkXG4gICAgXCJyaXBwbGVfY29sb3JcIjogMHhmZjAwMDAsXG4gIH0sXG4gIFwiSVwiOiB7XG4gICAgXCJub3Rlc1wiOiBbXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJHXCIsIFwiQVwiXSxcbiAgICBcIm9jdGF2ZXNcIjogWzAsIDAsIDAsIDAsIDBdLFxuICAgIFwicmVsYXRpdmVfbm90ZXNcIjogW1wiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiR1wiLCBcIkFcIl0sXG4gICAgXCJyZWxhdGl2ZV9vY3RhdmVzXCI6IFswLCAwLCAwLCAwLCAwXSxcbiAgICBcImNvbG9yXCI6IDB4YzNjMDQ1LFxuICAgIFwicmlwcGxlX2NvbG9yXCI6IDB4ZmZmZjAwLFxuICB9LFxuICBcIlZcIjoge1xuICAgIFwicmVsYXRpdmVfbm90ZXNcIjogW1wiQlwiLCBcIkRcIiwgXCJGXCIsIFwiR1wiLCBcIkFcIl0sXG4gICAgXCJyZWxhdGl2ZV9vY3RhdmVzXCI6IFstMSwgMCwgMCwgMCwgMF0sXG4gICAgXCJub3Rlc1wiOiBbXCJHXCIsIFwiQVwiLCBcIkJcIiwgXCJEXCIsIFwiRlwiXSxcbiAgICBcIm9jdGF2ZXNcIjogWy0xLCAtMSwgLTEsIDAsIDBdLFxuICAgIFwiY29sb3JcIjogMHhjMDgwMzIsXG4gICAgXCJyaXBwbGVfY29sb3JcIjogMHgwMGZmMDAsXG4gIH0sXG4gIFwiaWlcIjoge1xuICAgIFwicmVsYXRpdmVfbm90ZXNcIjogW1wiQlwiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkFcIl0sXG4gICAgXCJyZWxhdGl2ZV9vY3RhdmVzXCI6IFstMSwgMCwgMCwgMCwgMF0sXG4gICAgXCJub3Rlc1wiOiBbXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJBXCIsIFwiQlwiXSxcbiAgICBcIm9jdGF2ZXNcIjogWzAsIDAsIDAsIDAsIDBdLFxuICAgIFwiY29sb3JcIjogMHg2YmJjNWEsXG4gICAgXCJyaXBwbGVfY29sb3JcIjogMHgwMGZmZmYsXG4gIH0sXG4gIFwidmlcIjoge1xuICAgIFwicmVsYXRpdmVfbm90ZXNcIjogW1wiQlwiLCBcIkNcIiwgXCJFXCIsIFwiRlwiLCBcIkFcIl0sXG4gICAgXCJyZWxhdGl2ZV9vY3RhdmVzXCI6IFstMSwgMCwgMCwgMCwgMF0sXG4gICAgXCJub3Rlc1wiOiBbXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJFXCIsIFwiRlwiXSxcbiAgICBcIm9jdGF2ZXNcIjogWy0xLCAtMSwgMCwgMCwgMF0sXG4gICAgXCJjb2xvclwiOiAweDU0NTViNyxcbiAgICBcInJpcHBsZV9jb2xvclwiOiAweDAwMDBmZixcbiAgfSxcbiAgXCJpaWlcIjoge1xuICAgIFwicmVsYXRpdmVfbm90ZXNcIjogW1wiQlwiLCBcIkNcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIl0sXG4gICAgXCJyZWxhdGl2ZV9vY3RhdmVzXCI6IFstMSwgMCwgMCwgMCwgMF0sXG4gICAgXCJub3Rlc1wiOiBbXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJCXCIsIFwiQ1wiXSxcbiAgICBcIm9jdGF2ZXNcIjogWzAsIDAsIDAsIDAsIDFdLFxuICAgIFwiY29sb3JcIjogMHg4YTQ5YmQsXG4gICAgXCJyaXBwbGVfY29sb3JcIjogMHhmZjAwZmYsXG4gIH0sXG59O1xuXG5leHBvcnQge0NvbnN0YW50cywgU2NhbGVzLCBDb250cm9sc307XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL0FwcERhdGEuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///1\n");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_three__ = __webpack_require__(0);\n\n\nvar Materials = {};\n\nMaterials.ripple = function(options) {\n  var defaultOptions = {\n    width: 512,\n    height: 512,\n  };\n  options = Object.assign({}, defaultOptions, options);\n  return new __WEBPACK_IMPORTED_MODULE_0__node_modules_three__[\"ShaderMaterial\"]({\n    name: \"ripple\",\n    uniforms: {\n      u_mainTex: {value: null}, // Texture of the current frame\n      u_backTex: {value: null}, // Texture of the previous frame\n      u_sceneTex: {value: null}, // New additions from the scene\n      u_texelSize: {value: new __WEBPACK_IMPORTED_MODULE_0__node_modules_three__[\"Vector2\"](1/options.width, 1/options.height)},\n      u_damping: {value: 0.995},\n      u_speed: {value: 1.0},\n    },\n    vertexShader: `\n      varying vec2 v_uv;\n      void main() {\n        v_uv = uv;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n      }\n    `,\n    fragmentShader: `\n      varying vec2 v_uv;\n\n      uniform sampler2D u_mainTex;\n      uniform sampler2D u_backTex;\n      uniform sampler2D u_sceneTex;\n      uniform vec2 u_texelSize;\n      uniform float u_damping;\n      uniform float u_speed;\n\n      vec2 offset[4];\n\n      void main() {\n        offset[0] = vec2(-1.0, 0.0);\n        offset[1] = vec2(1.0, 0.0);\n        offset[2] = vec2(0.0, 1.0);\n        offset[3] = vec2(0.0, -1.0);\n\n        vec4 sum = vec4(0.0);\n\n        for (int i = 0; i < 4 ; i++){\n          sum += texture2D(u_mainTex, v_uv + offset[i] * u_texelSize * u_speed);\n        }\n        //  make an average and subtract the center value\n        sum = (sum / 2.0) - texture2D(u_backTex, v_uv);\n        sum *= u_damping;\n\n        vec4 sceneCol = texture2D(u_sceneTex, v_uv);\n        gl_FragColor = mix(sum, sceneCol, sceneCol.a);\n        gl_FragColor = sum + sceneCol;\n      }\n    `,\n  });\n};\n\nMaterials.indicatorLight = function() {\n  return new __WEBPACK_IMPORTED_MODULE_0__node_modules_three__[\"ShaderMaterial\"]({\n    name: \"indicator light\",\n    transparent: true,\n    uniforms: {\n      u_color: {value: new __WEBPACK_IMPORTED_MODULE_0__node_modules_three__[\"Color\"](0xff00ff)},\n      u_brightness: {value: 1.0},\n      u_isOn: {value: 1.0},\n    },\n    vertexShader: `\n      varying vec2 v_uv;\n      void main() {\n        v_uv = uv;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n      }\n    `,\n    fragmentShader: `\n      varying vec2 v_uv;\n      uniform vec3 u_color;\n      uniform float u_brightness;\n      uniform float u_isOn;\n      void main() {\n        float dist = length(v_uv - vec2(0.5));\n        float centerCircle = 1.0 - smoothstep(0.0, 0.2, dist);\n        float outerGlow = (1.0 - smoothstep(0.1, 0.5, dist)) * u_brightness;\n        float alpha = outerGlow + centerCircle * u_isOn;\n        gl_FragColor = vec4(u_color, alpha);\n      }\n    `,\n  });\n};\n\n/* harmony default export */ __webpack_exports__[\"a\"] = (Materials);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL2pzL01hdGVyaWFscy5qcz9hNDI1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvdGhyZWVcIjtcblxudmFyIE1hdGVyaWFscyA9IHt9O1xuXG5NYXRlcmlhbHMucmlwcGxlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgd2lkdGg6IDUxMixcbiAgICBoZWlnaHQ6IDUxMixcbiAgfTtcbiAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XG4gICAgbmFtZTogXCJyaXBwbGVcIixcbiAgICB1bmlmb3Jtczoge1xuICAgICAgdV9tYWluVGV4OiB7dmFsdWU6IG51bGx9LCAvLyBUZXh0dXJlIG9mIHRoZSBjdXJyZW50IGZyYW1lXG4gICAgICB1X2JhY2tUZXg6IHt2YWx1ZTogbnVsbH0sIC8vIFRleHR1cmUgb2YgdGhlIHByZXZpb3VzIGZyYW1lXG4gICAgICB1X3NjZW5lVGV4OiB7dmFsdWU6IG51bGx9LCAvLyBOZXcgYWRkaXRpb25zIGZyb20gdGhlIHNjZW5lXG4gICAgICB1X3RleGVsU2l6ZToge3ZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMigxL29wdGlvbnMud2lkdGgsIDEvb3B0aW9ucy5oZWlnaHQpfSxcbiAgICAgIHVfZGFtcGluZzoge3ZhbHVlOiAwLjk5NX0sXG4gICAgICB1X3NwZWVkOiB7dmFsdWU6IDEuMH0sXG4gICAgfSxcbiAgICB2ZXJ0ZXhTaGFkZXI6IGBcbiAgICAgIHZhcnlpbmcgdmVjMiB2X3V2O1xuICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2X3V2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XG4gICAgICB9XG4gICAgYCxcbiAgICBmcmFnbWVudFNoYWRlcjogYFxuICAgICAgdmFyeWluZyB2ZWMyIHZfdXY7XG5cbiAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfbWFpblRleDtcbiAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfYmFja1RleDtcbiAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfc2NlbmVUZXg7XG4gICAgICB1bmlmb3JtIHZlYzIgdV90ZXhlbFNpemU7XG4gICAgICB1bmlmb3JtIGZsb2F0IHVfZGFtcGluZztcbiAgICAgIHVuaWZvcm0gZmxvYXQgdV9zcGVlZDtcblxuICAgICAgdmVjMiBvZmZzZXRbNF07XG5cbiAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgb2Zmc2V0WzBdID0gdmVjMigtMS4wLCAwLjApO1xuICAgICAgICBvZmZzZXRbMV0gPSB2ZWMyKDEuMCwgMC4wKTtcbiAgICAgICAgb2Zmc2V0WzJdID0gdmVjMigwLjAsIDEuMCk7XG4gICAgICAgIG9mZnNldFszXSA9IHZlYzIoMC4wLCAtMS4wKTtcblxuICAgICAgICB2ZWM0IHN1bSA9IHZlYzQoMC4wKTtcblxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDQgOyBpKyspe1xuICAgICAgICAgIHN1bSArPSB0ZXh0dXJlMkQodV9tYWluVGV4LCB2X3V2ICsgb2Zmc2V0W2ldICogdV90ZXhlbFNpemUgKiB1X3NwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAgbWFrZSBhbiBhdmVyYWdlIGFuZCBzdWJ0cmFjdCB0aGUgY2VudGVyIHZhbHVlXG4gICAgICAgIHN1bSA9IChzdW0gLyAyLjApIC0gdGV4dHVyZTJEKHVfYmFja1RleCwgdl91dik7XG4gICAgICAgIHN1bSAqPSB1X2RhbXBpbmc7XG5cbiAgICAgICAgdmVjNCBzY2VuZUNvbCA9IHRleHR1cmUyRCh1X3NjZW5lVGV4LCB2X3V2KTtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gbWl4KHN1bSwgc2NlbmVDb2wsIHNjZW5lQ29sLmEpO1xuICAgICAgICBnbF9GcmFnQ29sb3IgPSBzdW0gKyBzY2VuZUNvbDtcbiAgICAgIH1cbiAgICBgLFxuICB9KTtcbn07XG5cbk1hdGVyaWFscy5pbmRpY2F0b3JMaWdodCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcbiAgICBuYW1lOiBcImluZGljYXRvciBsaWdodFwiLFxuICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgIHVuaWZvcm1zOiB7XG4gICAgICB1X2NvbG9yOiB7dmFsdWU6IG5ldyBUSFJFRS5Db2xvcigweGZmMDBmZil9LFxuICAgICAgdV9icmlnaHRuZXNzOiB7dmFsdWU6IDEuMH0sXG4gICAgICB1X2lzT246IHt2YWx1ZTogMS4wfSxcbiAgICB9LFxuICAgIHZlcnRleFNoYWRlcjogYFxuICAgICAgdmFyeWluZyB2ZWMyIHZfdXY7XG4gICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZfdXYgPSB1djtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcbiAgICAgIH1cbiAgICBgLFxuICAgIGZyYWdtZW50U2hhZGVyOiBgXG4gICAgICB2YXJ5aW5nIHZlYzIgdl91djtcbiAgICAgIHVuaWZvcm0gdmVjMyB1X2NvbG9yO1xuICAgICAgdW5pZm9ybSBmbG9hdCB1X2JyaWdodG5lc3M7XG4gICAgICB1bmlmb3JtIGZsb2F0IHVfaXNPbjtcbiAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZmxvYXQgZGlzdCA9IGxlbmd0aCh2X3V2IC0gdmVjMigwLjUpKTtcbiAgICAgICAgZmxvYXQgY2VudGVyQ2lyY2xlID0gMS4wIC0gc21vb3Roc3RlcCgwLjAsIDAuMiwgZGlzdCk7XG4gICAgICAgIGZsb2F0IG91dGVyR2xvdyA9ICgxLjAgLSBzbW9vdGhzdGVwKDAuMSwgMC41LCBkaXN0KSkgKiB1X2JyaWdodG5lc3M7XG4gICAgICAgIGZsb2F0IGFscGhhID0gb3V0ZXJHbG93ICsgY2VudGVyQ2lyY2xlICogdV9pc09uO1xuICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHVfY29sb3IsIGFscGhhKTtcbiAgICAgIH1cbiAgICBgLFxuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1hdGVyaWFscztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vanMvTWF0ZXJpYWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///3\n");

/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("Object.defineProperty(__webpack_exports__, \"__esModule\", { value: true });\n/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_underscore__ = __webpack_require__(2);\n/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_underscore___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_underscore__);\n/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Textures__ = __webpack_require__(12);\n/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Materials__ = __webpack_require__(3);\n/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__AppData__ = __webpack_require__(1);\n/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, \"underscore\", function() { return __WEBPACK_IMPORTED_MODULE_0_underscore___default.a; });\n/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, \"Textures\", function() { return __WEBPACK_IMPORTED_MODULE_1__Textures__[\"a\"]; });\n/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, \"Materials\", function() { return __WEBPACK_IMPORTED_MODULE_2__Materials__[\"a\"]; });\n/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, \"Constants\", function() { return __WEBPACK_IMPORTED_MODULE_3__AppData__[\"a\"]; });\n\n\n\n\n\n\n// This entry point exports as a library, with the RS namespace. Export anything that you want to\n// refer to from the testbed script.\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMTEuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy90ZXN0YmVkRW50cnlQb2ludC5qcz9jZmNiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1bmRlcnNjb3JlIGZyb20gXCJ1bmRlcnNjb3JlXCI7XG5cbmltcG9ydCBUZXh0dXJlcyBmcm9tIFwiLi9UZXh0dXJlc1wiO1xuaW1wb3J0IE1hdGVyaWFscyBmcm9tIFwiLi9NYXRlcmlhbHNcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiLi9BcHBEYXRhXCI7XG5cbi8vIFRoaXMgZW50cnkgcG9pbnQgZXhwb3J0cyBhcyBhIGxpYnJhcnksIHdpdGggdGhlIFJTIG5hbWVzcGFjZS4gRXhwb3J0IGFueXRoaW5nIHRoYXQgeW91IHdhbnQgdG9cbi8vIHJlZmVyIHRvIGZyb20gdGhlIHRlc3RiZWQgc2NyaXB0LlxuXG5leHBvcnQge1xuICB1bmRlcnNjb3JlLFxuICBUZXh0dXJlcyxcbiAgTWF0ZXJpYWxzLFxuICBDb25zdGFudHNcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL3Rlc3RiZWRFbnRyeVBvaW50LmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDEiXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///11\n");

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_three__ = __webpack_require__(0);\n\n\nfunction AssetLoadError(message) {\n  this.message = message;\n  this.name = \"AssetLoadError\";\n}\nAssetLoadError.prototype = new Error();\n\nvar _textureCache = {};\n\nvar createTexture = function(filename, src) {\n  var tex = new __WEBPACK_IMPORTED_MODULE_0__node_modules_three__[\"Texture\"](new Image());\n\n  tex.image.onload = function() {\n    tex.needsUpdate = true;\n    _textureCache[filename].loaded = true;\n  };\n  tex.image.onerror = function() {\n    console.warn(\"failed to load texture: \" + filename);\n  };\n  _textureCache[filename] = {\n    texture: tex,\n    src: src,\n    loaded: false,\n  };\n};\n\n// get returns a THREE.Texture immediately, but also can accept a callback that\n// will be called when the texture is actually loaded. Use the callback when you\n// want to, for example, prevent rendering a mesh with a not-yet-loaded texture.\n// The callback will be called with (err, texture).\n// NOTE: Except in places where the texture is optional, you probably shouldn't\n// use this. Use `promise` instead, to wait for the texture to load and more\n// easily handle errors.\nvar get = function(filename, optionalCallback) {\n  var cached = _textureCache[filename];\n  if (!cached) {\n    throw new Error(`No texture named \"${filename}\" exists`);\n  }\n\n  if (cached.loaded) {\n    if (optionalCallback) {\n      setTimeout(function() {\n        optionalCallback(null, cached.texture);\n      }, 0);\n    }\n    return cached.texture;\n  }\n\n  if (cached.parent) {\n    cached.parent.texture.image.src = cached.parent.src;\n    if (optionalCallback) {\n      cached.parent.texture.image.addEventListener(\"load\", function() {\n        optionalCallback(null, cached.texture);\n      });\n      cached.parent.texture.image.addEventListener(\"error\", function(e) {\n        optionalCallback(new AssetLoadError(`Failed to load texture \"${filename}\"`), cached.texture);\n      });\n    }\n    return cached.texture;\n  }\n\n  cached.texture.image.src = cached.src;\n\n  if (optionalCallback) {\n    cached.texture.image.addEventListener(\"load\", function() {\n      optionalCallback(null, cached.texture);\n    });\n    cached.texture.image.addEventListener(\"error\", function(e) {\n      optionalCallback(new AssetLoadError(`Failed to load texture \"${filename}\"`), cached.texture);\n    });\n  }\n  return cached.texture;\n};\n\n// promise returns a Promise that resolves with the texture when it is loaded.\nfunction promise(filename) {\n  return new Promise(function(resolve, reject) {\n    get(filename, function(err, tex) {\n      if (err) {\n        reject(err);\n      } else {\n        resolve(tex);\n      }\n    });\n  });\n}\n\n// loadAll starts loading all textures immediately. This can be useful for\n// calling at start up to get \"eager\" behavior.\nvar loadAll = function() {\n  Object.keys(_textureCache).forEach(function(filename) {\n    get(filename);\n  });\n};\n\n/* harmony default export */ __webpack_exports__[\"a\"] = ({\n  createTexture,\n  get,\n  promise,\n  loadAll,\n});\n// export default Textures;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMTIuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9UZXh0dXJlcy5qcz8yZmRiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvdGhyZWVcIjtcblxuZnVuY3Rpb24gQXNzZXRMb2FkRXJyb3IobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB0aGlzLm5hbWUgPSBcIkFzc2V0TG9hZEVycm9yXCI7XG59XG5Bc3NldExvYWRFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxudmFyIF90ZXh0dXJlQ2FjaGUgPSB7fTtcblxudmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbihmaWxlbmFtZSwgc3JjKSB7XG4gIHZhciB0ZXggPSBuZXcgVEhSRUUuVGV4dHVyZShuZXcgSW1hZ2UoKSk7XG5cbiAgdGV4LmltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRleC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgX3RleHR1cmVDYWNoZVtmaWxlbmFtZV0ubG9hZGVkID0gdHJ1ZTtcbiAgfTtcbiAgdGV4LmltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLndhcm4oXCJmYWlsZWQgdG8gbG9hZCB0ZXh0dXJlOiBcIiArIGZpbGVuYW1lKTtcbiAgfTtcbiAgX3RleHR1cmVDYWNoZVtmaWxlbmFtZV0gPSB7XG4gICAgdGV4dHVyZTogdGV4LFxuICAgIHNyYzogc3JjLFxuICAgIGxvYWRlZDogZmFsc2UsXG4gIH07XG59O1xuXG4vLyBnZXQgcmV0dXJucyBhIFRIUkVFLlRleHR1cmUgaW1tZWRpYXRlbHksIGJ1dCBhbHNvIGNhbiBhY2NlcHQgYSBjYWxsYmFjayB0aGF0XG4vLyB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSB0ZXh0dXJlIGlzIGFjdHVhbGx5IGxvYWRlZC4gVXNlIHRoZSBjYWxsYmFjayB3aGVuIHlvdVxuLy8gd2FudCB0bywgZm9yIGV4YW1wbGUsIHByZXZlbnQgcmVuZGVyaW5nIGEgbWVzaCB3aXRoIGEgbm90LXlldC1sb2FkZWQgdGV4dHVyZS5cbi8vIFRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCB3aXRoIChlcnIsIHRleHR1cmUpLlxuLy8gTk9URTogRXhjZXB0IGluIHBsYWNlcyB3aGVyZSB0aGUgdGV4dHVyZSBpcyBvcHRpb25hbCwgeW91IHByb2JhYmx5IHNob3VsZG4ndFxuLy8gdXNlIHRoaXMuIFVzZSBgcHJvbWlzZWAgaW5zdGVhZCwgdG8gd2FpdCBmb3IgdGhlIHRleHR1cmUgdG8gbG9hZCBhbmQgbW9yZVxuLy8gZWFzaWx5IGhhbmRsZSBlcnJvcnMuXG52YXIgZ2V0ID0gZnVuY3Rpb24oZmlsZW5hbWUsIG9wdGlvbmFsQ2FsbGJhY2spIHtcbiAgdmFyIGNhY2hlZCA9IF90ZXh0dXJlQ2FjaGVbZmlsZW5hbWVdO1xuICBpZiAoIWNhY2hlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm8gdGV4dHVyZSBuYW1lZCBcIiR7ZmlsZW5hbWV9XCIgZXhpc3RzYCk7XG4gIH1cblxuICBpZiAoY2FjaGVkLmxvYWRlZCkge1xuICAgIGlmIChvcHRpb25hbENhbGxiYWNrKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBvcHRpb25hbENhbGxiYWNrKG51bGwsIGNhY2hlZC50ZXh0dXJlKTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgICByZXR1cm4gY2FjaGVkLnRleHR1cmU7XG4gIH1cblxuICBpZiAoY2FjaGVkLnBhcmVudCkge1xuICAgIGNhY2hlZC5wYXJlbnQudGV4dHVyZS5pbWFnZS5zcmMgPSBjYWNoZWQucGFyZW50LnNyYztcbiAgICBpZiAob3B0aW9uYWxDYWxsYmFjaykge1xuICAgICAgY2FjaGVkLnBhcmVudC50ZXh0dXJlLmltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBvcHRpb25hbENhbGxiYWNrKG51bGwsIGNhY2hlZC50ZXh0dXJlKTtcbiAgICAgIH0pO1xuICAgICAgY2FjaGVkLnBhcmVudC50ZXh0dXJlLmltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIG9wdGlvbmFsQ2FsbGJhY2sobmV3IEFzc2V0TG9hZEVycm9yKGBGYWlsZWQgdG8gbG9hZCB0ZXh0dXJlIFwiJHtmaWxlbmFtZX1cImApLCBjYWNoZWQudGV4dHVyZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlZC50ZXh0dXJlO1xuICB9XG5cbiAgY2FjaGVkLnRleHR1cmUuaW1hZ2Uuc3JjID0gY2FjaGVkLnNyYztcblxuICBpZiAob3B0aW9uYWxDYWxsYmFjaykge1xuICAgIGNhY2hlZC50ZXh0dXJlLmltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgb3B0aW9uYWxDYWxsYmFjayhudWxsLCBjYWNoZWQudGV4dHVyZSk7XG4gICAgfSk7XG4gICAgY2FjaGVkLnRleHR1cmUuaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIG9wdGlvbmFsQ2FsbGJhY2sobmV3IEFzc2V0TG9hZEVycm9yKGBGYWlsZWQgdG8gbG9hZCB0ZXh0dXJlIFwiJHtmaWxlbmFtZX1cImApLCBjYWNoZWQudGV4dHVyZSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZC50ZXh0dXJlO1xufTtcblxuLy8gcHJvbWlzZSByZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHRleHR1cmUgd2hlbiBpdCBpcyBsb2FkZWQuXG5mdW5jdGlvbiBwcm9taXNlKGZpbGVuYW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBnZXQoZmlsZW5hbWUsIGZ1bmN0aW9uKGVyciwgdGV4KSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSh0ZXgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gbG9hZEFsbCBzdGFydHMgbG9hZGluZyBhbGwgdGV4dHVyZXMgaW1tZWRpYXRlbHkuIFRoaXMgY2FuIGJlIHVzZWZ1bCBmb3Jcbi8vIGNhbGxpbmcgYXQgc3RhcnQgdXAgdG8gZ2V0IFwiZWFnZXJcIiBiZWhhdmlvci5cbnZhciBsb2FkQWxsID0gZnVuY3Rpb24oKSB7XG4gIE9iamVjdC5rZXlzKF90ZXh0dXJlQ2FjaGUpLmZvckVhY2goZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgICBnZXQoZmlsZW5hbWUpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY3JlYXRlVGV4dHVyZSxcbiAgZ2V0LFxuICBwcm9taXNlLFxuICBsb2FkQWxsLFxufTtcbi8vIGV4cG9ydCBkZWZhdWx0IFRleHR1cmVzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9qcy9UZXh0dXJlcy5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAxIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///12\n");

/***/ })
/******/ ]);