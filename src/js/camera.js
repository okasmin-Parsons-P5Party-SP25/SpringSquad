// Camera functionality to follow player around grid from here:
// https://github.com/jbakse/p5party_foundation/blob/tomb/src/js/util/camera.js
export class Camera {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  follow(targetX, targetY, easing = 0) {
    this.x = lerp(this.x, targetX, easing);
    this.y = lerp(this.y, targetY, easing);
  }
}
