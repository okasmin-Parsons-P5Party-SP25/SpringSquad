import { nPlayers, nRows, nCols, w, h, isInWaterPathsGrid } from "./utilities.js";
import { makePath, waterPathType } from "./path.js";
import { getLandType, landTypes } from "./land.js";

const createGridEntry = (row, col, type, key, enabled = [], tileInfo = [], sharedPath = []) => {
  return {
    //position info
    row,
    col,

    //drawing info
    w,
    h,
    x: w * col,
    y: h * row,

    type, //determines what image to draw

    //objects
    key, //the index of a player if it is and false otherwise

    // idx for each player who can go on that cell
    enabled,

    // these fields are related to paths section
    tileInfo,
    sharedPath,
  };
};

/**
 * Creates the Paths grid section
 */
function createPathsGrid() {
  //template states
  const allEnabled = [];
  const allDisabled = [];
  const playerPaths = [];
  const playerKeys = [];
  for (let playerNum = 0; playerNum < nPlayers; playerNum++) {
    allEnabled.push(true);
    allDisabled.push(false);
    let playerPath = makePath(nRows, nCols, playerNum);

    let tries = 0;
    while (tries < 5 && playerPath.length < 2 * nRows) {
      playerPath = makePath(nRows, nCols, playerNum);
      tries++;
    }
    playerPaths.push(playerPath);

    const key = playerPath[playerPath.length - 1];
    playerKeys.push(key);
  }

  const pathsGrid = [];
  for (let rowNum = 0; rowNum < nRows; rowNum++) {
    const row = [];
    for (let colNum = 0; colNum < nCols; colNum++) {
      //set the enabled list based on the paths
      let enabledList = [...allDisabled];
      let key = false;
      let sharedPath = false;
      const tileInfos = [false, false];
      const type = waterPathType;

      for (let playerNum = 0; playerNum < nPlayers; playerNum++) {
        //check if its in each player path
        for (const [px, py] of playerPaths[playerNum]) {
          if (px === rowNum && py === colNum) {
            //if its in the paths
            // type = "water";
            tileInfos[playerNum] = pathTileInfo(rowNum, colNum, playerNum, playerPaths);
            enabledList[playerNum] = true;
            break;
          }
        }
        //check if its a key
        if (rowNum === playerKeys[playerNum][0] && colNum === playerKeys[playerNum][1]) {
          key = playerNum;
          // console.log("KEY", key, rowNum, colNum);
        }
      }

      //handle overlapping tiles
      sharedPath = enabledList[0] && enabledList[1];

      if (sharedPath) {
        // if (random() < 0.5) {
        //   enabledList[0] = false;
        // } else {
        //   enabledList[1] = false;
        // }

        const sharedNbrs = getNbrs([rowNum, colNum]);
        //look at this row above and to the left
        for (const [sharedNbrRow, sharedNbrCol] of sharedNbrs) {
          if (sharedNbrRow > rowNum || sharedNbrCol > colNum) {
            continue;
          }
          let sharedNbrEntry;
          if (sharedNbrRow < rowNum) {
            sharedNbrEntry = pathsGrid[sharedNbrRow][sharedNbrCol];
          } else {
            //same row
            sharedNbrEntry = row[sharedNbrCol];
          }

          if (sharedNbrEntry.shared_path) {
            console.log("shared");
            enabledList = sharedNbrEntry.enabled;
          }
        }
      }

      const gridEntry = createGridEntry(
        rowNum,
        colNum,
        type,
        key,
        enabledList,
        tileInfos,
        sharedPath
      );
      row.push(gridEntry);
    }
    pathsGrid.push(row);
  }
  return pathsGrid;
}

/**
 * Creates the Land grid section
 */
function createLandGrid() {
  const landGrid = [];
  for (let rowNum = 0; rowNum < nRows; rowNum++) {
    const row = [];
    // this section is the bottom half in the overall grid
    const overallGridRow = rowNum + nRows;
    for (let colNum = 0; colNum < nCols; colNum++) {
      const type = getLandType(rowNum, colNum);
      let key = false;
      if (type === landTypes.finalKey) {
        key = 3; // in this section key is valid for either player
      }

      let enabled = [];
      // can always go on these types of cells
      if (
        type === landTypes.water ||
        type === landTypes.lilypad ||
        type === landTypes.lilypadMagic ||
        type === landTypes.mint
      ) {
        enabled = [true, true];
      }

      const gridEntry = createGridEntry(overallGridRow, colNum, type, key, enabled);
      row.push(gridEntry);
    }
    landGrid.push(row);
  }
  return landGrid;
}

/**
 * Returns the overall Grid structure
 */
export function createGrid() {
  const pathsGrid = createPathsGrid();
  const landGrid = createLandGrid();

  // sections get "stacked" for overall grid
  return [...pathsGrid, ...landGrid];
}

/**
 * Check cell to validate a player's move
 * returns an object to determine if the player can move to that cell
 * and if the cell holds the player's key
 */
export function checkCell(grid, playerIdx, rIdx, cIdx, currRIdx = undefined, currCIdx = undefined) {
  const entry = grid[rIdx][cIdx];
  const waterPath = isInWaterPathsGrid(entry.type);

  let isMyKey;
  if (waterPath) {
    // for water paths key needs to match player index
    isMyKey = entry.key === playerIdx;
  } else {
    // for land, key is 3 for both players
    isMyKey = entry.key === 3;
  }

  let validMove = entry.enabled[playerIdx];

  // land section - some cells only valid depending on previous tile type
  if (!validMove && !waterPath) {
    if (currRIdx && currCIdx) {
      const prevEntry = grid[currRIdx][currCIdx];
      validMove = checkLandCell(entry, prevEntry);
    }
  }

  return { validMove, isMyKey, type: entry.type, waterPath };
}

/**
 * Check land cells
 * target destinations:
 * grass - can get on from lilypad or lilypadBridge or grass (requires current pos)
 * lilypad - can always get on
 * lilypadBridge - can only get on from land or other lilypad bridge (requires current pos)
 * lilypadMagic - can always get on
 * mint - can always get on
 * finalKey - can always get on
 */
function checkLandCell(entry, prevEntry) {
  console.log("check land cell");
  if (!prevEntry) {
    return false;
  }
  const type = entry.type;
  const prevType = prevEntry.type;

  if (type === landTypes.grass) {
    if (
      prevType === landTypes.lilypadBridge ||
      prevType === landTypes.grass ||
      prevType === landTypes.lilypad ||
      prevType === landTypes.finalKey
    ) {
      return true;
    }
  }

  if (type === landTypes.lilypadBridge) {
    if (prevType === landTypes.lilypadBridge || prevType === landTypes.grass) {
      return true;
    }
  }

  if (type === landTypes.finalKey) {
    if (prevType === landTypes.grass) {
      return true;
    }
  }

  return false;
}

/**
 * Path helper function
 */
function getNbrs(p) {
  const nbrs = [];
  const pcol = p[0];
  const prow = p[1];

  if (prow > 0) {
    nbrs.push([pcol, prow - 1]);
  }

  if (prow < nRows - 1) {
    nbrs.push([pcol, prow + 1]);
  }
  if (pcol > 0) {
    nbrs.push([pcol - 1, prow]);
  }

  if (pcol < nCols - 1) {
    nbrs.push([pcol + 1, prow]);
  }
  return nbrs;
}

/**
 * Path helper function
 * checks if the inputed rowNum, colNum is a corner of any path
 */
function pathTileInfo(rowNum, colNum, playerNum, playerPaths) {
  const nbrs = getNbrs([rowNum, colNum]);
  let nbrAbove = false;
  let nbrBelow = false;
  let nbrLeft = false;
  let nbrRight = false;
  let nbrTypes = [];

  for (const [nbrRowNum, nbrCol] of nbrs) {
    for (const [pathRowNum, pathCol] of playerPaths[playerNum]) {
      //only interested if the nbr is in the path
      if (nbrRowNum === pathRowNum && nbrCol === pathCol) {
        if (nbrRowNum === rowNum) {
          //same row so check left and right
          if (nbrCol < colNum) {
            nbrTypes.push("left");
            nbrLeft = true;
          } else if (nbrCol > colNum) {
            nbrTypes.push("right");
            nbrRight = true;
          }
        } else if (nbrCol === colNum) {
          //same row so check above and below
          if (nbrRowNum < rowNum) {
            nbrAbove = true;
            nbrTypes.push("top");
          } else if (nbrRowNum > rowNum) {
            nbrBelow = true;
            nbrTypes.push("bottom");
          }
        }
      }
    }
  }
  nbrTypes = [...new Set(nbrTypes)];
  if (nbrTypes.length === 4) {
    return ["d", 0];
  } else if (nbrTypes.length === 3) {
    if (nbrBelow === false) {
      return ["c", 180];
    } else if (nbrAbove === false) {
      return ["c", 0];
    } else if (nbrLeft === false) {
      return ["c", -90];
    } else {
      return ["c", 90];
    }
  } else if (nbrTypes.length === 2) {
    if (nbrLeft && nbrRight) {
      //in a line
      return ["b", 0];
    } else if (nbrAbove && nbrBelow) {
      return ["b", 90];
    } else {
      if (nbrBelow === false && nbrLeft === false) {
        //bottom left
        return ["a", -90];
      } else if (nbrBelow === false && nbrRight === false) {
        return ["a", -180];
      } else if (nbrAbove === false && nbrRight === false) {
        return ["a", 90];
      } else if (nbrAbove === false && nbrLeft === false) {
        return ["a", 0];
      }
    }
  } else {
    if (nbrBelow) {
      return ["e", 0];
    }
    if (nbrAbove) {
      return ["e", 180];
    }
    if (nbrLeft) {
      return ["e", 90];
    }
    if (nbrRight) {
      return ["e", -90];
    }
  }
}
