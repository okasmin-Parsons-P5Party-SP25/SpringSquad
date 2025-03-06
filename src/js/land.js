import { nRows, nCols } from "./utilities.js";

// for drawing the correct image
export const landTypes = {
  grass: "grass",
  lilypad: "lilypad",
  lilypadBridge: "lilypad_bridge",
  lilypadMagic: "lilypad_magic",
  mint: "mint",
};

// positions of the land elements

const makeLand = () => {
  const island = [];
  for (let row = nRows - 2; row < nRows; row++) {
    for (let col = 1; col < 3; col++) {
      island.push([row, col]);
    }
  }
  const landMass = [];
  for (let row = 4; row <= nRows; row++) {
    for (let col = nCols - 2; col <= nCols; col++) {
      landMass.push([row, col]);
    }
  }
  for (let row = nRows - 3; row <= nRows; row++) {
    for (let col = nCols - 4; col <= nCols - 2; col++) {
      landMass.push([row, col]);
    }
  }

  return [...island, ...landMass];
};

const land = makeLand();

const lilypad = [
  [2, 8],
  [3, 8],
];

const lilypadBridge = [
  [9, 3],
  [9, 4],
  [9, 5],
];

const mint = [[8, 8]];

const includesPos = (list, pos) => {
  return list.some(([x, y]) => x === pos[0] && y === pos[1]);
};

export const getLandType = (row, col) => {
  let type = undefined;
  if (includesPos(land, [row, col])) {
    type = landTypes.grass;
  }
  if (includesPos(lilypad, [row, col])) {
    type = landTypes.lilypad;
  }
  if (includesPos(lilypadBridge, [row, col])) {
    type = landTypes.lilypadBridge;
  }
  if (includesPos(mint, [row, col])) {
    type = landTypes.mint;
  }
  return type;
};
