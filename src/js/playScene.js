import { changeScene, scenes, guests, me, shared } from "./main.js";
import {
  nCols,
  nRows,
  w,
  h,
  nPlayers,
  playerStartPos,
  designUtils,
  iterateGuestsIdx,
  godMode,
} from "./utilities.js";
import { landTypes } from "./land.js";
import { Camera } from "./camera.js";
import { checkCell } from "./grid.js";

// let me;
let timer;
let player0ImgTadpole;
let player0ImgFrog;
export let player0Images = {};
let player1ImgTadpole;
let player1ImgFrog;
let key0Img;
let key1Img;
export let player1Images = {};
const landSectionImages = {};

const grassImages = [];

let tileImages = [];

// TODO update this to true if either player is on that space
export let lilypadBridgeEnabled = false;

export function preload() {
  timer = document.getElementById("timer-val");

  player0ImgTadpole = loadImage("./images/YellowTadpole.png");
  player0ImgFrog = loadImage("./images/YellowFrog.png");
  key0Img = loadImage("./images/Key-Yellow.png");
  player0Images = {
    tadpole: player0ImgTadpole,
    frog: player0ImgFrog,
    key: key0Img,
  };

  player1ImgTadpole = loadImage("./images/RedTadpole.png");
  player1ImgFrog = loadImage("./images/RedFrog.png");
  key1Img = loadImage("./images/Key-Red.png");
  player1Images = {
    tadpole: player1ImgTadpole,
    frog: player1ImgFrog,
    key: key1Img,
  };

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

  landSectionImages.grass = loadImage("./images/Grass-1.png");
  landSectionImages.lilypad = loadImage("./images/Tiles/Tiles-0a.png");
  landSectionImages.lilypadBridge = loadImage("./images/Tiles/Tiles-0b.png");
  landSectionImages.mint = loadImage("./images/Tiles/Tiles-0f.png");
  landSectionImages.finalKey = loadImage("./images/Key-Pink.png");
  landSectionImages.lilypadMagic = loadImage("./images/Tiles/Tiles-0d.png");
}

export function enter() {
  // shouldn't ever get to this screen with less than 2 players, but adding this just in case
  if (guests.length < 2 && !godMode) {
    console.log("reached play scene with fewer than 2 players!");
    changeScene(scenes.title);
  }
}

export function update() {
  if (shared.timeVal === 0 && !godMode) {
    changeScene(scenes.lose);
  }

  // can only win/lose if there are 2 players
  if (guests[0] && guests[0].gameState >= 0 && guests[1] && guests[1].gameState >= 0) {
    if (guests[0].gameState === 2 && guests[1].gameState === 2) {
      changeScene(scenes.win);
    }
    if (guests[0].gameState === 3 || guests[1].gameState === 3) {
      changeScene(scenes.lose);
    }
  }
}

export function draw() {
  background(designUtils.waterColor);

  if (!godMode) {
    me.camera.follow(me.col * w, me.row * h, 0.1);
    // scroll
    if (me.idx === 0) {
      // player 0 starts top left on grid
      translate(width * 0.25, height * 0.25);
    }
    if (me.idx === 1) {
      // player 1 starts top right on grid
      translate(width * 0.75, height * 0.25);
    }
    scale(1);
    translate(-me.camera.x, -me.camera.y);
  }

  drawGrid(shared.grid);
  drawPlayers(guests);
  // drawDoors();
  updateTimer();
}

export function setPlayerStarts() {
  const maxIdx = iterateGuestsIdx(guests);
  for (let i = 0; i < maxIdx; i++) {
    if (guests[i] === me) {
      me.idx = i;
      me.row = playerStartPos[i][0];
      me.col = playerStartPos[i][1];
      const camera = new Camera(me.col * w, me.row * h);
      me.camera = camera;
    }
  }
}

/**
 * draws the grid and all its elements
 */
function drawGrid(grid) {
  stroke("white");
  for (const row of grid) {
    for (const entry of row) {
      //background
      tint(255, 100);
      // TODO use this in future for grass background areas
      // if (noise(entry.x, entry.y) < 0.2) {
      //   image(grassImages[1], entry.x, entry.y, entry.w, entry.h);
      // } else if (noise(entry.x, entry.y) < 0.4) {
      //   image(grassImages[2], entry.x, entry.y, entry.w, entry.h);
      // } else if (noise(entry.x, entry.y) < 0.5) {
      //   image(grassImages[3], entry.x, entry.y, entry.w, entry.h);
      // } else {
      //   image(grassImages[0], entry.x, entry.y, entry.w, entry.h);
      // }

      tint(255, 255);
      blendMode(BLEND);

      // paths section
      if (entry.row < nRows) {
        //enabled status drawing
        if (entry.enabled.every((e) => e === false)) {
          // TODO what goes here?
        } else {
          for (let playerNum = 0; playerNum < nPlayers; playerNum++) {
            if (entry.tileInfo[playerNum] !== false) {
              push();
              imageMode(CENTER);
              angleMode(DEGREES);
              translate(entry.x + entry.w / 2, entry.y + entry.h / 2);
              const imgKey = entry.tileInfo[playerNum][0];
              const imgRotation = entry.tileInfo[playerNum][1];
              rotate(imgRotation);

              image(tileImages[playerNum][imgKey], 0, 0, entry.w, entry.h);
              // text(img_key,0,0)
              pop();
            }
          }
          for (let playerNum = 0; playerNum < nPlayers; playerNum++) {
            if (entry.enabled[playerNum]) {
              push();
              imageMode(CENTER);
              angleMode(DEGREES);
              translate(entry.x + entry.w / 2, entry.y + entry.h / 2);
              const imgKey = entry.tileInfo[playerNum][0];
              const imgRotation = entry.tileInfo[playerNum][1];
              rotate(imgRotation);
              image(tileImages[playerNum][imgKey], 0, 0, entry.w, entry.h);
              // text(img_key,0,0)
              pop();
            }
          }
        }

        if (typeof entry.key === "number") {
          push();
          const x = entry.x;
          const y = entry.y;
          let img = player0Images.key;
          if (entry.key === 1) {
            img = player1Images.key;
          }
          image(img, x, y, w, h);
          pop();
        }
      }
      // land section
      else {
        if (entry.type === landTypes.grass) {
          image(landSectionImages.grass, entry.x, entry.y, entry.w, entry.h);
        }
        if (entry.type === landTypes.lilypad) {
          image(landSectionImages.lilypad, entry.x, entry.y, entry.w, entry.h);
        }
        if (entry.type === landTypes.lilypadBridge && lilypadBridgeEnabled) {
          image(landSectionImages.lilypadBridge, entry.x, entry.y, entry.w, entry.h);
        }
        if (entry.type === landTypes.mint) {
          image(landSectionImages.grass, entry.x, entry.y, entry.w, entry.h);
          image(landSectionImages.mint, entry.x, entry.y, entry.w, entry.h);
        }
        if (entry.type === landTypes.finalKey) {
          image(landSectionImages.grass, entry.x, entry.y, entry.w, entry.h);
          image(landSectionImages.finalKey, entry.x, entry.y, entry.w, entry.h);
        }
        if (entry.type === landTypes.lilypadMagic) {
          image(landSectionImages.lilypadMagic, entry.x, entry.y, entry.w, entry.h);
        }
      }
    }
  }
}

function drawPlayers(guests) {
  const maxIdx = iterateGuestsIdx(guests);
  for (let i = 0; i < maxIdx; i++) {
    push();
    const guest = guests[i];
    let img;
    if (i === 0) {
      img = player0Images.tadpole;
      if (guest.gameState > 0) {
        img = player0Images.frog;
      }
    }
    if (i === 1) {
      img = player1Images.tadpole;
      if (guest.gameState > 0) {
        img = player1Images.frog;
      }
    }
    image(img, guest.col * h, guest.row * w, w, h);
    pop();
  }
}

function updateTimer() {
  if (partyIsHost()) {
    if (frameCount % 60 === 0) {
      shared.timeVal = Math.max(shared.timeVal - 1, 0);
    }
  }
  const s = shared.timeVal;
  const m = Math.floor(s / 60);
  let sStr = `${s % 60}`;
  if (sStr.length === 1) {
    sStr = `0${s % 60}`;
  }

  timer.textContent = `${m}:${sStr}`;
}

export function keyPressed() {
  let newRow = me.row;
  let newCol = me.col;

  if (keyCode === UP_ARROW) {
    if (me.row === 0) return;
    newRow = me.row - 1;
  }
  if (keyCode === DOWN_ARROW) {
    if (me.row === nRows * 2 - 1) return;
    newRow = me.row + 1;
  }
  if (keyCode === LEFT_ARROW) {
    if (me.col === 0) return;
    newCol = me.col - 1;
  }
  if (keyCode === RIGHT_ARROW) {
    if (me.col === nCols - 1) return;
    newCol = me.col + 1;
  }

  const valid = handleMove(newRow, newCol, me.row, me.col);
  if (
    valid
    // || godMode
  ) {
    me.row = newRow;
    me.col = newCol;
  }
}

function handleMove(newRow, newCol, prevRow, prevCol) {
  if (me.gameState > 0 && newRow < nRows) {
    return true;
  }
  const { validMove, isMyKey } = checkCell(shared.grid, me.idx, newRow, newCol, prevRow, prevCol);

  if (isMyKey) {
    checkKeys();
  }
  return validMove;
}

function checkKeys() {
  // found key in paths section
  if (me.gameState === 0) {
    me.gameState = 1;
  }

  if (me.gameState === 1) {
    // TODO fill this in
    // if in land section
    // and if both players are standing on keys
    // set gameState for both players to 2
  }
}
