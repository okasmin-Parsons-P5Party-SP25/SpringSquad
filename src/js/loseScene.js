import { changeScene, scenes, shared, me } from "./main.js";
import { drawGrid } from "./playScene.js";
import { canvasHeight, canvasWidth, designUtils } from "./utilities.js";

// TODO update to show win screen

const zoomTime = 100;
let remainingTime = zoomTime;
const frogImages = [];

export function preload() {
  for (let i = 1; i <= 2; i++) {
    const endImages = {
      win: loadImage(`../../images/Tiles/Tiles-${i}.png`),
      lose: loadImage(`../../images/Tiles/Tiles-${i}*.png`),
    };
    frogImages.push(endImages);
  }
}

export function draw() {
  background(designUtils.waterColor);
  push();
  const endSf = 0.5;
  const startSf = 1;
  // translate(canvasWidth / 2, canvasHeight / 2);
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
  text("YOU LOSE :(", canvasWidth * 0.5, 100);
  pop();

  push();
  imageMode(CENTER);
  console.log(me.idx);

  const loseImage = frogImages[me.idx].lose;
  image(loseImage, canvasWidth * 0.5, canvasHeight * 0.5, 100, 100);

  pop();
}

// TODO do we need this? Reset button will also bring you back to title
export function mousePressed() {
  changeScene(scenes.title);
}
