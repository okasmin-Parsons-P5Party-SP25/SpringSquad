import { changeScene, scenes, guests, me, shared } from "./main.js";
import { nCols, nRows, w, h, nPlayers, gridHeight, gridWidth } from "./utilities.js";
import { Camera } from "./camera.js";
import { checkCell } from "./grid.js";

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

  // TODO update these to be set by paths
  door0 = { row: doorRow, col: Math.floor(random(1, nRows / 2)) };
  door1 = { row: doorRow, col: Math.floor(random(nRows / 2, nRows - 1)) };
}

export function enter() {
  //TODO what goes here?
}

export function update() {
  if (shared.timeVal === 0) {
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
  image(grassImages[2], 0, 0, gridWidth, gridHeight);
  drawGrid(shared.grid);
  drawPlayers(guests);
  drawDoors();
  updateTimer();
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
function drawGrid(grid) {
  stroke("white");
  for (const row of grid) {
    for (const entry of row) {
      //background
      tint(255, 100);
      if (noise(entry.x, entry.y) < 0.2) {
        image(grassImages[1], entry.x, entry.y, entry.w, entry.h);
      } else if (noise(entry.x, entry.y) < 0.4) {
        image(grassImages[2], entry.x, entry.y, entry.w, entry.h);
      } else if (noise(entry.x, entry.y) < 0.5) {
        image(grassImages[3], entry.x, entry.y, entry.w, entry.h);
      } else {
        image(grassImages[0], entry.x, entry.y, entry.w, entry.h);
      }

      tint(255, 255);
      blendMode(BLEND);

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

        if (entry.key === 0) {
          image(key0Img, x, y, w, h);
        }
        if (entry.key === 1) {
          image(key1Img, x, y, w, h);
        }
        pop();
      }
    }
  }
}

function drawPlayers(guests) {
  const maxIdx = iterateGuestsIdx(guests);
  for (let i = 0; i < maxIdx; i++) {
    push();
    const guest = guests[i];
    translate(guest.col * h, guest.row * w);

    if (i === 0) {
      image(player0Img, 0, 0, w, h);
    }
    if (i === 1) {
      image(player1Img, 0, 0, w, h);
    }
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
    if (me.row === nRows - 1) return;
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

  const valid = handleMove(newRow, newCol);
  if (valid) {
    me.row = newRow;
    me.col = newCol;
  }
}

function handleMove(newRow, newCol) {
  if (me.gameState === 1) {
    checkCellDoor(newRow, newCol);
    return true;
  }
  const { validMove, isMyKey } = checkCell(shared.grid, me.idx, newRow, newCol);
  if (isMyKey) me.gameState = 1;
  return validMove;
}

function checkCellDoor(newRow, newCol) {
  if (newRow !== doorRow) {
    return;
  }
  // win states - go to correct door
  if (me.idx === 0 && newCol === door0.col) {
    me.gameState = 2;
    return;
  }
  if (me.idx === 1 && newCol === door1.col) {
    me.gameState = 2;
    return;
  }
  // lose states - go to the wrong door
  if (me.idx === 0 && newCol === door1.col) {
    me.gameState = 3;
    return;
  }
  if (me.idx === 1 && newCol === door0.col) {
    me.gameState = 3;
    return;
  }
  return;
}

function drawDoors() {
  push();
  fill("#007fff");
  if (guests[0] && guests[0].gameState > 0) {
    ellipse(door1.col * h + h / 2, door1.row * w + w / 2, 15, 15);
  }
  if (guests[1] && guests[1].gameState > 0) {
    ellipse(door0.col * h + h / 2, door0.row * w + w / 2, 15, 15);
  }
  pop();
}
