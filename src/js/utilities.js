// IMPORTANT!!!
// change this to true for playtesting, and false for real play
export const godMode = false;

import { waterPathType } from "./path.js";

const timeMax = 2 * 60; //for gameplay timer
const nPlayers = 2;
const nRows = 10;
const nCols = nRows;
const gridWidth = 850;
const gridHeight = 850;
const w = gridWidth / nCols; //cell width
const h = gridHeight / nRows; //cell height
const canvasHeight = godMode ? 2000 : 600;
const canvasWidth = godMode ? 1000 : 600;
const playerStartPos = [
  [0, 0],
  [0, nCols - 1],
];

export {
  timeMax,
  nPlayers,
  nRows,
  nCols,
  gridHeight,
  gridWidth,
  w,
  h,
  canvasHeight,
  canvasWidth,
  playerStartPos,
};

export function iterateGuestsIdx(guests) {
  if (guests.length === 1) {
    return 1;
  } else {
    return nPlayers;
  }
}

export const designUtils = {
  waterColor: "#9cc8db",
  lightGreenColor: "#d9e0a2",
};

export const includesPos = (list, pos) => {
  return list.some(([x, y]) => x === pos[0] && y === pos[1]);
};

export const isInWaterPathsGrid = (entryType) => {
  return entryType === waterPathType;
};

export const finalScene = {
  win: "win",
  lose: "lose",
};

export function setTimer(sharedTimeVal) {
  const timer = document.getElementById("timer-val");
  const s = sharedTimeVal;
  const m = Math.floor(s / 60);
  let sStr = `${s % 60}`;
  if (sStr.length === 1) {
    sStr = `0${s % 60}`;
  }

  timer.textContent = `${m}:${sStr}`;
}
