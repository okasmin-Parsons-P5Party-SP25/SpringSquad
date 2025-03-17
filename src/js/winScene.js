import { changeScene, scenes, shared, me } from "./main.js";
import { drawGrid } from "./playScene.js";

// TODO update to show win screen

const zoomTime = 100;
let remainingTime = zoomTime;
const frogImages = [];

export function preload() {
  // frogImages.push(loadImage("../../images/PinkFrog-Front.png"));
  // frogImg = loadImage("../../images/PinkFrog-Front.png");
  for (let i = 1; i <= 2; i++) {
    const endImages = {
      win: loadImage(`../../images/Tiles/Tiles-${i}.png`),
      lose: loadImage(`../../images/Tiles/Tiles-${i}*.png`),
    };
    frogImages.push(endImages);
  }
}

export function draw() {
  push();
  const endSf = 0.5;
  const startSf = 1;
  if (remainingTime > 0) {
    const percentDone = map(remainingTime, zoomTime, 0, 0, 1);
    const currentSf = lerp(startSf, endSf, percentDone);
    remainingTime--;
    scale(currentSf);
  }
  if (remainingTime === 0) {
    scale(endSf);
  }
  drawGrid(shared.grid);
  filter(BLUR, 5);
  pop();

  // background("black");

  push();
  fill("white");
  text("You Win :)", 10, 20);
  pop();

  push();
  imageMode(CENTER);
  console.log(me.idx);
  if (me.gameState === 2) {
    const winImage = frogImages[me.idx].win;
    image(winImage, width * 0.5, height * 0.5, 100, 100);
  } else {
    const loseImage = frogImages[me.idx].lose;
    image(loseImage, width * 0.5, height * 0.5, 100, 100);
  }

  pop();
}

// TODO do we need this? Reset button will also bring you back to title
export function mousePressed() {
  changeScene(scenes.title);
}
