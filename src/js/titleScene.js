import { changeScene, scenes, guests, me } from "./main.js";
import { player0Images, player1Images } from "./playScene.js";
import { iterateGuestsIdx, w, nPlayers, designUtils } from "./utilities.js";

let logoImg;

// TODO only host can start the game?

export function preload() {
  logoImg = loadImage("../../images/Spring-Squad-Logo.png");
}

export function draw() {
  background(designUtils.lightGreenColor);

  textFont("Futura");
  fill("#152e50");

  push();
  imageMode(CENTER);
  const newWidth = width * 0.7;
  const aspectRatio = logoImg.height / logoImg.width;
  const newHeight = newWidth * aspectRatio;
  image(logoImg, width * 0.5, height * 0.25, newWidth, newHeight);
  pop();

  // TODO style this
  // draw players (max 2)
  drawPlayers(guests);

  // TODO style this
  // change text depending on how many guests
  let lowerText;
  push();
  textAlign(CENTER);
  if (guests.length < nPlayers) {
    lowerText = "waiting for another player to join!";
  }
  if (guests.length === nPlayers) {
    lowerText = "click to start the game!";
  }
  if (guests.length > nPlayers) {
    lowerText = "there are too many players here to start the game!";
  }
  text(lowerText, width * 0.5, height * 0.8);
  pop();
}

export function mousePressed() {
  if (guests.length === 2) {
    changeScene(scenes.play);
  }
}

function drawPlayers(guests) {
  const maxIdx = iterateGuestsIdx(guests);
  for (let i = 0; i < maxIdx; i++) {
    push();
    imageMode(CENTER);
    textAlign(CENTER);
    fill("#152e50");

    const player0X = width * 0.25;
    const player1X = width * 0.75;

    let x = player0X;
    const y = height * 0.6;
    let img = player0Images.tadpole;
    const imgSize = w;

    let textX = player0X;

    if (i === 1) {
      img = player1Images.tadpole;
      x = player1X;
    }

    if (me.idx === 1) {
      textX = player1X;
    }

    image(img, x, y, imgSize, imgSize);
    text("me", textX, y + imgSize / 2 + 5);
    pop();
  }
}
