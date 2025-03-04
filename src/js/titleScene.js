import { changeScene, scenes, guests, me } from "./main.js";
import { player0Images, player1Images } from "./playScene.js";
import { iterateGuestsIdx, w, nPlayers } from "./utilities.js";

// let logoImg

// TODO update to show game logo
// TODO only host can start the game?

export function preload() {
  // logoImg = loadImage("../../images/");
}

export function draw() {
  background("black");

  // TODO replace this
  push();
  fill("white");
  text("title scene", 10, 20);
  pop();

  // TODO style this
  // draw players (max 2)
  drawPlayers(guests);

  // TODO style this
  // change text depending on how many guests
  let lowerText;
  push();
  textAlign(CENTER);
  fill("white");
  if (guests.length < nPlayers) {
    lowerText = "waiting for another player to join!";
  }
  if (guests.length === nPlayers) {
    lowerText = "click to start the game!";
  }
  if (guests.length > nPlayers) {
    lowerText = "there are too many players here to start the game!";
  }
  text(lowerText, width * 0.5, height * 0.75);
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
    fill("white");

    const player0X = width * 0.25;
    const player1X = width * 0.75;

    let x = player0X;
    const y = height * 0.5;
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
