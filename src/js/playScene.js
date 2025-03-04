import { changeScene, scenes, guests, me } from "./main.js";
import { nCols, w, h, nPlayers } from "./utilities.js";
import { Camera } from "./camera.js";

// import {} from '../../public/images'

// let me;
let timer;
let door0;
let door1;
const doorRow = 0;
let player0Img;
let player1Img;
let key0Img;
let key1Img;

const grassImages = [];

let tileImages = [];
let blueTile;

let pY; // position of ball
let dY; // velocity of ball

export function preload() {
  timer = document.getElementById("timer-val");

  player0Img = loadImage("./images/BlueFrog-Front.png");
  player1Img = loadImage("./images/PinkFrog-Front.png");

  key0Img = loadImage("./images/Key-Blue.png");
  key1Img = loadImage("./images/Key-Pink.png");

  for (let grassImgIdx = 0; grassImgIdx < 4; grassImgIdx++) {
    const grassImg = loadImage(`./images/Grass-${grassImgIdx}.png`);
    grassImages.push(grassImg);
  }

  //water tiles
  for (let tileMode = 1; tileMode <= 3; tileMode++) {
    const imgs = {};
    for (const tileType of ["a", "b", "c", "d", "e"]) {
      const imgPath = `./images/Tiles/Tiles-${tileMode}${tileType}.png`;
      imgs[tileType] = loadImage(imgPath);
    }
    tileImages.push(imgs);
  }
  tileImages = [tileImages[0], tileImages[2]];
  blueTile = loadImage("./images/Tiles/Tiles-4.png");
}

export function enter() {
  pY = 100;
  dY = 0;
}

export function update() {
  // physics sim
  pY += dY; // momentum
  dY += 0.5; // gravity
  // test collision
  if (pY > height - 50) {
    pY = height - 50; // eject
    dY = -abs(dY) * 0.8; // bounce
    dY += 1; // fudge
    if (abs(dY) < 1) {
      // sticky
      dY = 0;
    }
  }
}

export function draw() {
  background("black");

  // draw info
  push();
  fill("white");
  text("play scene", 10, 20);
  pop();

  // draw ball
  push();
  fill("red");
  ellipse(width * 0.5, pY, 100, 100);
  pop();
}

export function mousePressed() {
  changeScene(scenes.title);
}

export function setPlayerStarts() {
  const playerStarts = [
    [0, 0],
    [0, nCols - 1],
  ];

  const maxIdx = iterateGuestsIdx(guests);
  for (let i = 0; i < maxIdx; i++) {
    if (guests[i] === me) {
      me.idx = i;
      me.row = playerStarts[i][0];
      me.col = playerStarts[i][1];
      const camera = new Camera(me.col * w, me.row * h);
      me.camera = camera;
    }
  }
}

// TODO remove need for this by limiting to 2 players
function iterateGuestsIdx(guests) {
  if (guests.length === 1) {
    ("return 1");
    return 1;
  } else {
    return nPlayers;
  }
}

/**
 * draws the grid and all its elements
 */
// function drawGrid(grid) {
//   stroke("white");
//   for (const row of grid) {
//     for (const entry of row) {
//       //background
//       tint(255, 100);
//       if (noise(entry.x, entry.y) < 0.2) {
//         image(grassImages[1], entry.x, entry.y, entry.w, entry.h);
//       } else if (noise(entry.x, entry.y) < 0.4) {
//         image(grassImages[2], entry.x, entry.y, entry.w, entry.h);
//       } else if (noise(entry.x, entry.y) < 0.5) {
//         image(grassImages[3], entry.x, entry.y, entry.w, entry.h);
//       } else {
//         image(grassImages[0], entry.x, entry.y, entry.w, entry.h);
//       }

//       tint(255, 255);
//       blendMode(BLEND);

//       //enabled status drawing
//       if (entry.enabled.every((e) => e === false)) {
//         // TODO what goes here?
//       } else {
//         for (let playerNum = 0; playerNum < nPlayers; playerNum++) {
//           if (entry.tile_info[playerNum] !== false) {
//             push();
//             imageMode(CENTER);
//             angleMode(DEGREES);
//             translate(entry.x + entry.w / 2, entry.y + entry.h / 2);
//             const imgKey = entry.tile_info[playerNum][0];
//             const imgRotation = entry.tile_info[playerNum][1];
//             rotate(imgRotation);

//             image(tileImages[playerNum][imgKey], 0, 0, entry.w, entry.h);
//             // text(img_key,0,0)
//             pop();
//           }
//         }
//         for (let playerNum = 0; playerNum < nPlayers; playerNum++) {
//           if (entry.enabled[playerNum]) {
//             push();
//             imageMode(CENTER);
//             angleMode(DEGREES);
//             translate(entry.x + entry.w / 2, entry.y + entry.h / 2);
//             const imgKey = entry.tile_info[playerNum][0];
//             const imgRotation = entry.tile_info[playerNum][1];
//             rotate(imgRotation);
//             image(tileImages[playerNum][imgKey], 0, 0, entry.w, entry.h);
//             // text(img_key,0,0)
//             pop();
//           }
//         }
//       }

//       if (typeof entry.key === "number") {
//         push();
//         const x = entry.x;
//         const y = entry.y;

//         if (entry.key === 0) {
//           image(key0Img, x, y, w, h);
//         }
//         if (entry.key === 1) {
//           image(key1Img, x, y, w, h);
//         }
//         pop();
//       }
//     }
//   }
// }
