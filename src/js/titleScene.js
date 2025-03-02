import { changeScene, scenes } from "./main.js";

let frogImg;

export function preload() {
  frogImg = loadImage("../../public/images/BlueFrog-Front.png");
}

export function draw() {
  background("black");

  // draw info
  push();
  fill("white");
  text("title scene", 10, 20);
  pop();

  // draw title
  push();
  // fill(noiseColor(millis() / 2000));
  imageMode(CENTER);
  image(frogImg, width * 0.5, height * 0.5, 100, 100);
  pop();
}

export function mousePressed() {
  changeScene(scenes.play);
}
