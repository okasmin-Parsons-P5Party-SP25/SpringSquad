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
  isInWaterPathsGrid,
} from "./utilities.js";
import { landTypes, isLilypadMagicCell } from "./land.js";
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
let particle;

const grassImages = [];

let tileImages = [];
const sounds = {
  swim: undefined,
  walk: undefined,
  collect: undefined,
  // 'celebrate':undefined
};

export function preload() {
  timer = document.getElementById("timer-val");

  for (const soundName of Object.keys(sounds)) {
    console.log(soundName);
    sounds[soundName] = loadSound(`./sounds/${soundName}.mp3`);
  }

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

  landSectionImages.grass = loadImage("./images/Tiles/Tiles-4c.png");
  landSectionImages.lilypad = loadImage("./images/Tiles/Tiles-0a.png");
  landSectionImages.lilypadBridge = loadImage("./images/Tiles/Tiles-0b.png");
  landSectionImages.mint = loadImage("./images/Tiles/Tiles-0f.png");
  landSectionImages.finalKey = loadImage("./images/Key-Pink.png");
  landSectionImages.lilypadMagic = loadImage("./images/Tiles/Tiles-0d.png");

  particle = loadImage("./images/particles.gif");
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

  if (winGame()) {
    changeScene(scenes.win);
  }

  for (const guest of guests) {
    if (guest.row >= nRows && isLilypadMagicCell(guest.row - nRows, guest.col)) {
      shared.lilypadBridgeEnabled = true;
      break;
    } else {
      shared.lilypadBridgeEnabled = false;
    }
  }
}

export function draw() {
  background(designUtils.waterColor);

  if (!godMode) {
    me.camera.follow(me.col * w, me.row * h, 0.1);
    // scroll
    translate(width * 0.5, height * 0.3);
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
export function drawGrid(grid) {
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
        if (entry.type === landTypes.lilypadBridge && shared.lilypadBridgeEnabled) {
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
    //draw particle behind guest
    const { validMove, isMyKey, type } = checkCell(shared.grid, i, guest.row, guest.col);
    if (i === me.idx) {
      console.log(type);
    }

    if ((validMove && isMyKey) || type === landTypes.lilypadMagic || type === landTypes.finalKey) {
      showParticle(guest.col * h, guest.row * w);
    }

    //draw guest
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

  handleMove(newRow, newCol, me.row, me.col);
}

function handleMove(newRow, newCol, prevRow, prevCol) {
  // otherwise check the destination cell
  const { validMove, isMyKey, type } = checkCell(
    shared.grid,
    me.idx,
    newRow,
    newCol,
    prevRow,
    prevCol
  );

  // tadpoles are never allowed in the land area
  const tadpoleInLandGrid = me.gameState === 0 && !isInWaterPathsGrid(type);
  if (tadpoleInLandGrid) {
    return;
  }

  // frogs can move anywhere in the water section
  const frogInWaterGrid = me.gameState > 0 && isInWaterPathsGrid(type);

  if (!validMove && !frogInWaterGrid) {
    return;
  }

  if (type && type === landTypes.lilypadBridge && !shared.lilypadBridgeEnabled) {
    return;
  }

  //play walk sound
  if (isInWaterPathsGrid(type) || type === landTypes.water) {
    sounds.swim.play();
  } else if (type === landTypes.grass) {
    sounds.walk.play();
  }

  // set new position for player
  me.row = newRow;
  me.col = newCol;

  if (isMyKey) {
    sounds.collect.play();
    // got key in paths section
    if (me.gameState === 0 && isInWaterPathsGrid(type)) {
      me.gameState = 1;
    }
  }
}

function winGame() {
  // both players need to be standing on land keys at the same time
  for (const guest of guests) {
    const { isMyKey, waterPath } = checkCell(shared.grid, guest.idx, guest.row, guest.col);
    if (waterPath) {
      return false;
    }
    if (!isMyKey) {
      return false;
    }
    if (guest.gameState < 1) {
      return false;
    }
  }
  return true;
}

function showParticle(x, y) {
  push();
  blendMode(SCREEN);
  const expandAmt = w / 2;
  image(particle, x - expandAmt / 2, y - expandAmt / 2, w + expandAmt, h + expandAmt);
  particle.play();
  pop();
}
