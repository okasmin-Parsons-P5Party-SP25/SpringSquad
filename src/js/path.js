const allowOverlapProb = 0;
import { nCols } from "./utilities.js";

// Object.assign(window, {
//   makePath,
//   overlaps,
//   sortPath,
// });

export function makePath(numRows, numCols, playerIdx) {
  //starting positions for players by index
  const playerStartPos = [
    [0, 0],
    [0, numCols - 1],
  ];

  //helper function
  function getNbrs(p) {
    const nbrs = [];
    const pcol = p[0];
    const prow = p[1];

    if (prow > 0) {
      nbrs.push([pcol, prow - 1]);
    }

    if (prow < numRows - 1) {
      nbrs.push([pcol, prow + 1]);
    }
    if (pcol > 0) {
      nbrs.push([pcol - 1, prow]);
    }

    if (pcol < numCols - 1) {
      nbrs.push([pcol + 1, prow]);
    }
    return nbrs;
  }

  //start the maze creation with a node in the top row

  let p = playerStartPos[0];
  let colBoundary = [(numRows * 3) / 4, numRows];
  if (playerIdx === 1) {
    p = playerStartPos[1];
    colBoundary = [0, numRows / 4];
  }

  const path = [p];

  //keep creating the path while its outside the finish boundary
  function isFinished(p) {
    const rowCondition = p[0] >= (numRows * 3) / 4; //end of the map
    const colCondition = colBoundary[0] < p[1] && p[1] < colBoundary[1]; //other side of the board

    return rowCondition && colCondition;
  }
  while (!isFinished(p)) {
    //before the end is hit
    const nbrs = getNbrs(p);
    let noncycleNbrs = [];
    for (const nbr of nbrs) {
      const nbrNbrs = getNbrs(nbr);
      const overlapBool = overlaps(nbrNbrs, path);
      if (!overlapBool || random() < allowOverlapProb) {
        noncycleNbrs.push(nbr);
      }
    }

    //now select a random non cycle neightbor to add
    if (noncycleNbrs.length === 0) {
      const r = random();
      if (r < 0.5 && nbrs.length >= 1) {
        noncycleNbrs = [nbrs[0]];
      } else if (r < 0.8) {
        noncycleNbrs = nbrs;
      } else {
        break;
      }

      // break;
    }

    p = random(noncycleNbrs);
    path.push(p);
  }

  // console.log("path", path);
  const sorted = sortPath(path);
  console.log("sorted path", sorted, playerIdx);
  return path;
}
function overlaps(l1, l2) {
  //returns true if more than one overlap
  let overlapCount = 0;
  for (const p1 of l1) {
    for (const p2 of l2) {
      if (p1[0] === p2[0] && p1[1] === p2[1]) {
        overlapCount += 1;
        if (overlapCount > 1) {
          return true;
        } else {
          break;
        }
      }
    }
  }
  return false;
}

function sortPath(path, playerIdx) {
  const o1 = 0;
  let o2 = 0;
  if (playerIdx === 1) {
    o2 = nCols - 1;
  }

  // sort by cloest to player start position to furthest from start position
  return path.sort((a, b) => {
    const dist1 = dist(o1, o2, a[0], a[1]);
    const dist2 = dist(o1, o2, b[0], b[1]);
    if (dist1 < dist2) {
      return -1;
    } else {
      return 1;
    }
  });
}
