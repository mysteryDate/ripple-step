import * as THREE from "../node_modules/three";
import {Constants} from "./AppData";

function ScaleChooser(scales) {
  THREE.Group.call(this);
  Object.keys(scales).forEach(function(scale, index) {
    var pickerKey = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(Constants.MATRIX_KEY_SIZE, Constants.MATRIX_KEY_SIZE),
      new THREE.MeshBasicMaterial({color: scales[scale].ripple_color})
    );
    this.add(pickerKey);
    pickerKey.position.set(index * (Constants.MATRIX_KEY_SIZE * (1 + Constants.SPACING_RATIO)), 0, 0);
    pickerKey.position.x -= 2.5 * (Constants.MATRIX_KEY_SIZE * (1 + Constants.SPACING_RATIO)); // Center it
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
