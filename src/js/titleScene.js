import { changeScene, scenes } from "./main.js";

// TODO update to show title screen
// TODO add logo
// TODO add button to start (now goes to play when click anywhere)
// TODO add waiting room for players and only allow play when 2 players

let frogImg;

export function preload() {
  frogImg = loadImage("../../images/BlueFrog-Front.png");
}

export function draw() {
  background("black");

  push();
  fill("white");
  text("title scene", 10, 20);
  pop();

  push();
  imageMode(CENTER);
  image(frogImg, width * 0.5, height * 0.5, 100, 100);
  pop();
}

export function mousePressed() {
  changeScene(scenes.play);
}
