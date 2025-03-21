import { changeScene, scenes, shared } from "./main.js";
import { drawGrid } from "./playScene.js";
import { canvasHeight, canvasWidth, designUtils, finalScene } from "./utilities.js";

// TODO add lose image

let endImages;

// variables for zoom effect
const zoomTime = 100;
let remainingTime;
let endSf;
let startSf;

export function preload() {
  endImages = {
    win: loadImage("../../images/Win-Screen.png"),
    lose: loadImage("../../images/Win-Screen.png"),
  };
}

export function enter() {
  remainingTime = zoomTime;
  endSf = 0.5;
  startSf = 1;
}

export function draw() {
  let img;
  let message;
  if (shared.finalScene === finalScene.win) {
    message = "WIN";
    img = endImages.win;
  } else if (shared.finalScene === finalScene.lose) {
    message = "LOSE";
    img = endImages.lose;
  } else {
    // we shouldn't be here in this state, but if so
    // send user back to title scene
    changeScene(scenes.title);
  }

  background(designUtils.waterColor);

  push();
  if (remainingTime > 0) {
    const percentDone = map(remainingTime, zoomTime, 0, 0, 1);
    const currentSf = lerp(startSf, endSf, percentDone);
    remainingTime--;
    scale(currentSf);
  }
  if (remainingTime === 0) {
    scale(endSf);
  }
  const blurAmount = map(remainingTime, zoomTime, 0, 0, 10);
  drawGrid(shared.grid);
  filter(BLUR, blurAmount);
  pop();

  push();
  noStroke();
  fill("black");
  textSize(20);
  textAlign(CENTER);
  text(message, canvasWidth * 0.5, 100);
  imageMode(CENTER);
  image(img, canvasWidth * 0.5, canvasHeight * 0.5, 100, 100);
  pop();
}

// TODO do we need this? Reset button will also bring you back to title
export function mousePressed() {
  changeScene(scenes.title);
}
