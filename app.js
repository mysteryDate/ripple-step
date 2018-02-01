import THREE from "./node_modules/three/build/three";
import bar from "./foo";
// const THREE = require("three");
bar();

// var THREE = THREELib(); // return THREE JS

var m = new THREE.MeshBasicMaterial();
window.m = m;
console.log(m);
// var context = new (window.AudioContext || window.webkitAudioContext)();
//
// //the synth
// var synth = new Tone.Synth().toMaster()
//   .set("envelope.attack", 0.04);
// //send audio to each of the effect channels
// var chorusSend = synth.send("chorus", -Infinity);
// var chebySend = synth.send("cheby", -Infinity);
// var autowahSend = synth.send("autowah", -Infinity);
// var reverbSend = synth.send("reverb", -Infinity);
// //make some effects
// var chorus = new Tone.Chorus()
//   .receive("chorus")
//   .toMaster();
// var cheby = new Tone.Chebyshev(50)
//   .receive("cheby")
//   .toMaster();
// var reverb = new Tone.Freeverb(0.8, 4000)
//   .receive("reverb")
//   .toMaster();
//
//   console.log("hey");
