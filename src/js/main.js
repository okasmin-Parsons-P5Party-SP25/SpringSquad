import * as titleScene from "./titleScene.js";
import * as playScene from "./playScene.js";
import * as endScene from "./endScene.js";
import { createGrid } from "./grid.js";
import { timeMax, canvasHeight, canvasWidth, godMode } from "./utilities.js";
export let shared;
export let guests;
export let me;

// all the available scenes
export const scenes = {
  title: titleScene,
  play: playScene,
  end: endScene,
};

let currentScene; // the scene being displayed

window.preload = function () {
  Object.values(scenes).forEach((scene) => scene.preload?.());

  partyConnect("wss://demoserver.p5party.org", "spring_squad_2");
  shared = partyLoadShared("shared", {
    grid: [],
    timeVal: timeMax,
    lilypadBridgeEnabled: false, // set to true in game when player walks on magic lilypad
    finalScene: undefined,
  });
  me = partyLoadMyShared({
    row: 0, //current grid position, initiate at 0 and set in setup
    col: 0, //current grid position, initiate at 0 and set in setup
    gameState: 0, //0 for started, 1 for key found, 2 for door opened, 3 for lose
    idx: 0, // initiate at 0 and set in setup
    camera: {},
  });

  guests = partyLoadGuestShareds();
};

window.setup = function () {
  createCanvas(canvasWidth, canvasHeight);
  noFill();
  noStroke();

  Object.values(scenes).forEach((scene) => scene.setup?.());

  if (godMode && currentScene !== scenes.play) {
    changeScene(scenes.play);
  } else if (currentScene !== scenes.title) {
    changeScene(scenes.title);
  }

  if (partyIsHost) {
    const grid = createGrid();
    shared.grid = grid;
  }

  setupUI();

  partyToggleInfo(false);

  playScene.setPlayerStarts();
};

window.draw = function () {
  // call update() and draw() on the current scene
  // (if the scene exists and has those functions)
  currentScene?.update?.();
  currentScene?.draw?.();
};

/// forward event handlers to the current scene, if they handle them
const p5Events = [
  // keyboard
  "keyPressed",
  "keyReleased",
  "keyTyped",

  // mouse
  "doubleClicked",
  "mouseDragged",
  "mouseReleased",
  "mouseWheel",
  "mouseMoved",
  "mouseClicked",
  "mousePressed",

  // touch
  "touchMoved",
  "touchStarted",
  "touchEnded",
];

for (const event of p5Events) {
  window[event] = () => currentScene?.[event]?.();
}

/// changeScene
// call this to tell the game to switch to a different scene
export function changeScene(newScene) {
  if (!newScene) {
    console.error("newScene not provided");
    return;
  }
  if (newScene === currentScene) {
    console.error("newScene is already currentScene");
    return;
  }
  currentScene?.leave?.();
  currentScene = newScene;
  currentScene.enter?.();
}

function setupUI() {
  //UI
  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", function () {
    reset();
    console.log("clicked reset");
  });

  const infoButton = document.getElementById("info-button");
  infoButton.addEventListener("click", function () {
    showInfo();
  });

  const hideInfoButton = document.getElementById("info-close");
  hideInfoButton.addEventListener("click", function () {
    hideInfo();
  });

  const PressButton = document.getElementById("press-kit-button");
  PressButton.addEventListener("click", function () {
    showPress();
  });

  const hidePressButton = document.getElementById("press-kit-close");
  hidePressButton.addEventListener("click", function () {
    hidePress();
  });

  const ProcessButton = document.getElementById("process-button");
  ProcessButton.addEventListener("click", function () {
    showProcess();
  });

  const hideProcessButton = document.getElementById("process-close");
  hideProcessButton.addEventListener("click", function () {
    hideProcess();
  });

}

function reset() {
  shared.finalScene = undefined;

  if (currentScene !== scenes.title) {
    changeScene(scenes.title);
  }

  //reset shared grid and time value
  shared.grid = createGrid();
  shared.timeVal = timeMax;

  //reset player states
  for (const guest of guests) {
    guest.row = 0;
    guest.col = 0;
    guest.gameState = 0;
    guest.idx = 0;
  }
  playScene.setPlayerStarts();
}

function showInfo() {
  const container = document.getElementById("info-container");
  container.className = "popup-container";
}

function hideInfo() {
  const container = document.getElementById("info-container");
  container.className = "popup-container hidden";
}

function showPress() {
  const container = document.getElementById("press-kit-container");
  container.className = "popup-container";
}

function hidePress() {
  const container = document.getElementById("press-kit-container");
  container.className = "popup-container hidden";
}

function showProcess() {
  const container = document.getElementById("process-container");
  container.className = "popup-container";
}

function hideProcess() {
  const container = document.getElementById("process-container");
  container.className = "popup-container hidden";
}
