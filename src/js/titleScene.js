import { changeScene, scenes, guests, me } from "./main.js";
import { nPlayers, designUtils } from "./utilities.js";

let logoImg;
let fontFutura;
let fontFuturaLight;
let player0Frog;
let player1Lilypad;
let player1Frog;
let openingLogoAnim;
let logoAnim;
let logoOpened = false;

// TODO only host can start the game?

export function preload() {
  logoImg = loadImage("../../images/Spring-Squad-Logo.png");

  fontFutura = loadFont("../../css/FuturaCyrillicDemi.ttf");
  fontFuturaLight = loadFont("../../css/FuturaCyrillicLight.ttf");

  player1Lilypad = loadImage("../../images/Tiles/LilyPad-1b.png");
  player0Frog = loadImage("../../images/Tiles/Tiles-2*.png");
  player1Frog = loadImage("../../images/Tiles/Tiles-1*.png");
  openingLogoAnim = loadImage("../../images/Spring-Squad-Logo.gif");
  logoAnim = loadImage("../../images/Spring-Squad-Logo 2.gif");
}

export function draw() {
  background(designUtils.lightGreenColor);

  textFont(fontFutura);
  noStroke();
  fill("#152e50");

  push();
  frameRate(50);
  imageMode(CENTER);
  const newWidth = width * 0.9;
  const aspectRatio = logoImg.height / logoImg.width;
  const newHeight = newWidth * aspectRatio;

  if (logoOpened) {
    image(logoAnim, width * 0.5, height * 0.25, newWidth, newHeight);
  } else {
    image(openingLogoAnim, width * 0.5, height * 0.25, newWidth, newHeight);

    if (
      openingLogoAnim.gifProperties.numFrames - 1 ===
      openingLogoAnim.gifProperties.displayIndex
    ) {
      logoOpened = true;
    }
  }

  pop();

  drawPlayers(guests);

  // change text depending on how many guests
  let lowerText;
  let textShrink = 0;
  push();
  textAlign(CENTER);
  if (guests.length < nPlayers) {
    lowerText = "waiting for another player to join!";
  }
  if (guests.length === nPlayers) {
    lowerText = "click to start the game!";
    textShrink = 2 * sin(frameCount * 0.1);
  }
  if (guests.length > nPlayers) {
    lowerText = "there are too many players here to start the game!";
  }
  textFont(fontFuturaLight);
  textSize(12 + textShrink);
  text(lowerText, width * 0.5, height * 0.9);
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

  const player0X = width * 0.3;
  const player1X = width * 0.7;
  let player0Yshift = 0;
  let player1Yshift = 0;
  const y = height * 0.6;
  const lilyY = y + 20;

  const imgSize = 160;
  let imgShrink = 0;

  //lilly pads
  if (guests.length <= 1) {
    imgShrink = 10 * sin(frameCount * 0.1);
  }
  image(player1Lilypad, player0X, lilyY, imgSize, imgSize);
  image(player1Lilypad, player1X, lilyY, imgSize - imgShrink, imgSize - imgShrink);

  //frogs
  const player0Dist = dist(mouseX, mouseY, player0X, y);
  const player1Dist = dist(mouseX, mouseY, player1X, y);
  if (player0Dist < imgSize / 2) {
    player0Yshift = ((sin(frameCount * 0.1) + 1) * imgSize) / 4;
  }
  if (player1Dist < imgSize / 2) {
    player1Yshift = ((sin(frameCount * 0.1) + 1) * imgSize) / 4;
  }
  image(player0Frog, player0X, y - player0Yshift, imgSize, imgSize);
  if (guests.length > 1) {
    image(player1Frog, player1X, y - player1Yshift, imgSize, imgSize);
  }

  let textX = undefined;
  if (me.idx === 0) {
    textX = player0X;
  } else if (me.idx === 1) {
    textX = player1X;
  }

  if (textX) {
    text("me", textX, y + imgSize / 2 + 20);
  }

  pop();
}
