import { changeScene, scenes } from "./main.js";

// TODO update to show win screen

let frogImg;

export function preload() {
  frogImg = loadImage("../../images/BlueFrog-Front.png");
}

export function draw() {
  background("black");

  push();
  fill("white");
  text("win scene :)", 10, 20);
  pop();

  push();
  imageMode(CENTER);
  image(frogImg, width * 0.5, height * 0.5, 100, 100);
  pop();
}

// TODO do we need this? Reset button will also bring you back to title
export function mousePressed() {
  changeScene(scenes.title);
}
