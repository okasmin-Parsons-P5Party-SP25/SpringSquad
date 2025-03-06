import { nPlayers, nRows, nCols, w, h } from "./utilities.js";
import { makePath } from "./path.js";
import { getLandType } from "./land.js";

function createLandGrid() {
  const grid = [];
  for (let rowNum = 0; rowNum < nRows; rowNum++) {
    const row = [];
    const overallGridRow = rowNum + nRows; // this section is the bottom half in the overall grid
    for (let colNum = 0; colNum < nCols; colNum++) {
      const type = getLandType(rowNum, colNum);
      const gridEntry = {
        //position info
        row: overallGridRow,
        col: colNum,

        //drawing info
        w: w,
        h: h,
        x: w * colNum,
        y: h * overallGridRow,

        type: type, //determines what image to draw

        // the are related to paths section - leaving here for consistency
        tileInfo: [],
        sharedPath: [],

        //objects
        key: false, //the index of a player if it is and false otherwise

        enabled: [],
      };

      row.push(gridEntry);
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Creates the Grid structure
 */
export function createGrid() {
  // first add the player paths to the grid
  //template states
  const allEnabled = [];
  const allDisabled = [];
  const playerPaths = [];
  const playerKeys = [];
  //   const playerDoors = [];
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

  //checks if the inputed rowNum, colNum is a corner of any path
  function tileInfo(rowNum, colNum, playerNum) {
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

  //create the grid
  const pathsGrid = [];
  for (let rowNum = 0; rowNum < nRows; rowNum++) {
    const row = [];
    for (let colNum = 0; colNum < nCols; colNum++) {
      //set the enabled list based on the paths
      let enabledList = [...allDisabled];
      let key = false;
      let sharedPath = false;
      const tileInfos = [false, false];
      let type;

      for (let playerNum = 0; playerNum < nPlayers; playerNum++) {
        //check if its in each player path
        for (const [px, py] of playerPaths[playerNum]) {
          if (px === rowNum && py === colNum) {
            //if its in the paths
            type = "water";
            tileInfos[playerNum] = tileInfo(rowNum, colNum, playerNum);
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
        if (random() < 0.5) {
          enabledList[0] = false;
        } else {
          enabledList[1] = false;
        }

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

      const gridEntry = {
        //position info
        row: rowNum,
        col: colNum,

        //drawing info
        w: w,
        h: h,
        x: w * colNum,
        y: h * rowNum,

        //determines the background
        type: type,
        tileInfo: tileInfos,
        sharedPath: sharedPath,

        //objects
        key: key, //the index of a player if it is and false otherwise

        enabled: enabledList,
      };

      row.push(gridEntry);
    }
    pathsGrid.push(row);
  }

  // generate land grid section
  const landGrid = createLandGrid();

  return [...pathsGrid, ...landGrid];
}

/**
 * Check cell to validate a player's move
 * returns an object to determine if the player can move to that cell
 * and if the cell holds the player's key
 */
export function checkCell(grid, playerIdx, rIdx, cIdx) {
  const entry = grid[rIdx][cIdx];
  const validMove = entry.enabled[playerIdx];
  const isMyKey = entry.key === playerIdx;
  return { validMove, isMyKey };
}

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
