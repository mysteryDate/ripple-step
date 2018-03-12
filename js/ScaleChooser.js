import * as THREE from "../node_modules/three";
import {Constants} from "./AppData";

function ScaleChooser(scales) {
  THREE.Group.call(this);
  Object.keys(scales).forEach(function(scale, index) {
    var pickerKey = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1),
      new THREE.MeshBasicMaterial({color: scales[scale].color})
    );
    this.add(pickerKey);
    pickerKey.position.set(index * ((1 + Constants.SPACING_RATIO)), 0, 0);
    pickerKey.position.x -= (Object.keys(scales).length/2 - 0.5) * (1 + Constants.SPACING_RATIO); // Center it
    pickerKey.scaleName = scale;
  }.bind(this));
  this.scales = scales;
}
ScaleChooser.prototype = Object.create(THREE.Object3D.prototype);

ScaleChooser.prototype.touchStart = function(raycaster) {
  var clickedScale = raycaster.intersectObjects(this.children)[0];
  if (clickedScale !== undefined) {
    window.app.setScale(this.scales[clickedScale.object.scaleName]);
  }
};

export default ScaleChooser;
