import { changeScene, scenes, shared } from "./main.js";
import { drawGrid } from "./playScene.js";
import { canvasHeight, canvasWidth, designUtils, finalScene } from "./utilities.js";

let endImages;
let fontFutura;

// variables for zoom effect
const zoomTime = 100;
let remainingTime;
let endSf;
let startSf;

export function preload() {
  endImages = {
    win: loadImage("../../images/Win-Screen.png"),
    // TODO add lose image
    lose: loadImage("../../images/Win-Screen.png"),
  };
  fontFutura = loadFont("../../css/FuturaCyrillicDemi.ttf");
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
    message = "you win!";
    img = endImages.win;
  } else if (shared.finalScene === finalScene.lose) {
    message = "lose...";
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

  noStroke();
  fill("black");
  textSize(40);
  textFont(fontFutura);
  textAlign(CENTER);
  text(message, canvasWidth * 0.5, height * 0.25);

  imageMode(CENTER);
  image(img, canvasWidth * 0.5, canvasHeight * 0.6, width * 0.7, width * 0.7);
  pop();
}
