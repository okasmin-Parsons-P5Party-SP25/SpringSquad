import { changeScene, scenes, guests, me } from "./main.js";
import { w, nPlayers, designUtils } from "./utilities.js";

let logoImg;
let fontFutura;
let fontFuturaLight;
let player0Frog;
let player1Lilypad;
let player1Frog;

// TODO only host can start the game?

export function preload() {
  logoImg = loadImage("../../images/Spring-Squad-Logo.png");
  fontFutura = loadFont("../../css/FuturaCyrillicDemi.ttf");
  fontFuturaLight = loadFont("../../css/FuturaCyrillicLight.ttf");

  player0Frog = loadImage("../../images/Tiles/LilyPad-2a.png");
  player1Lilypad = loadImage("../../images/Tiles/LilyPad-1b.png");
  player1Frog = loadImage("../../images/Tiles/LilyPad-1a.png");
}

export function draw() {
  background(designUtils.lightGreenColor);

  textFont(fontFutura);
  noStroke();
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
  textFont(fontFuturaLight);
  text(lowerText, width * 0.5, height * 0.8);
  pop();
}

export function mousePressed() {
  if (guests.length === 2) {
    changeScene(scenes.play);
  }
}

function drawPlayers(guests) {
  // host is yellow - on left
  // second player is red - right

  push();
  imageMode(CENTER);
  textAlign(CENTER);
  noStroke();
  fill("#152e50");

  const player0X = width * 0.25;
  const player1X = width * 0.75;
  const y = height * 0.6;

  const imgSize = w;

  image(player0Frog, player0X, y, imgSize, imgSize);

  const player1Img = guests.length > 1 ? player1Frog : player1Lilypad;
  image(player1Img, player1X, y, imgSize, imgSize);

  let textX = undefined;
  if (me.idx === 0) {
    textX = player0X;
  } else if (me.idx === 1) {
    textX = player1X;
  }

  if (textX) {
    text("me", textX, y + imgSize / 2 + 5);
  }

  pop();
}
