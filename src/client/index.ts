import CellGrid from "./cellGrid/cellGrid";
import Patterns from "../../public/patterns.json";

/* TS */

interface WaitingCell {
  i: number;
  j: number;
  state: "alive" | "dead";
}

interface Pattern {
  name: string;
  cells: Array<{ i: number; j: number }>;
}

/* GLOBALS */

const PATTERNS = [
  Patterns.spaceship.glider,
  Patterns.spaceship.lwss,
  Patterns.oscillator.pulsar,
];

/* HELPERS */

const boundIndex = (index: number, value: number, limit: number): number => {
  if (index + value < 0) {
    return (((index + value) % limit) + limit) % limit;
  }

  return (index + value) % limit;
};

const applyPatternToCanvas = (pattern: Pattern) => {
  for (const cell of pattern.cells) {
    grid.changeCellStateByMatrixIndexes(cell.i, cell.j, "alive");
  }

  const infoNamePattern = document.getElementById("info-name-pattern");

  if (infoNamePattern !== null)
    infoNamePattern.textContent = `Current pattern: ${pattern.name}`;
};

const cleanCanvas = () => {
  const limitRows = grid.cells.length;
  const limitColumns = grid.cells[0].length;

  for (let i = 0; i < limitRows; i++) {
    for (let j = 0; j < limitColumns; j++) {
      if (grid.cells[i][j].state == "alive") {
        grid.changeCellStateByMatrixIndexes(i, j, "dead");
      }
    }
  }
};

const resetCanvas = () => {
  cleanCanvas();
  grid.tickLoop("destroy", animationGameOfLife);
  toggle = "stop";
};

/* SCRIPT */

const gameOfLife = (grid: CellGrid) => {
  const isStateAndRendered = (
    grid: CellGrid,
    i: number,
    j: number,
    state: string,
  ) => {
    // DEVNOTES: since we store updates in an array, checking rendered isn't required
    return grid.cells[i][j].state == state && grid.cells[i][j].rendered;
  };
  const adjacentCells = (
    grid: CellGrid,
    i: number,
    j: number,
    state: string,
  ) => {
    let countAlive = 0;
    const limitRows = grid.cells.length;
    const limitColumns = grid.cells[0].length;

    // Left
    if (isStateAndRendered(grid, i, boundIndex(j, -1, limitColumns), state))
      countAlive++;
    // Right
    if (isStateAndRendered(grid, i, boundIndex(j, 1, limitColumns), state))
      countAlive++;
    // Top
    if (isStateAndRendered(grid, boundIndex(i, -1, limitRows), j, state))
      countAlive++;
    // Bottom
    if (isStateAndRendered(grid, boundIndex(i, 1, limitRows), j, state))
      countAlive++;
    // Top left
    if (
      isStateAndRendered(
        grid,
        boundIndex(i, -1, limitRows),
        boundIndex(j, -1, limitColumns),
        state,
      )
    )
      countAlive++;
    // Top right
    if (
      isStateAndRendered(
        grid,
        boundIndex(i, -1, limitRows),
        boundIndex(j, 1, limitColumns),
        state,
      )
    )
      countAlive++;
    // Bottom left
    if (
      isStateAndRendered(
        grid,
        boundIndex(i, 1, limitRows),
        boundIndex(j, -1, limitColumns),
        state,
      )
    )
      countAlive++;
    // Bottom right
    if (
      isStateAndRendered(
        grid,
        boundIndex(i, 1, limitRows),
        boundIndex(j, 1, limitColumns),
        state,
      )
    )
      countAlive++;

    return countAlive;
  };

  const waitingCells = Array<WaitingCell>();

  for (let i = 0; i < grid.cells.length; i++) {
    for (let j = 0; j < grid.cells[0].length; j++) {
      const adjacentAliveCells = adjacentCells(grid, i, j, "alive");

      // Rules of Game of Life
      if (grid.cells[i][j].state == "alive") {
        if (adjacentAliveCells != 2 && adjacentAliveCells != 3)
          waitingCells.push({ i: i, j: j, state: "dead" });
      } else {
        if (adjacentAliveCells == 3)
          waitingCells.push({ i: i, j: j, state: "alive" });
      }
    }
  }

  for (const cell of waitingCells) {
    grid.changeCellStateByMatrixIndexes(cell.i, cell.j, cell.state);
  }

  grid.render();
};

let toggle: "start" | "stop" = "stop";
const animationGameOfLife = {
  name: "animationGameOfLife",
  run: gameOfLife,
};

const grid = new CellGrid();
await grid.init();

applyPatternToCanvas({ name: "Blank canvas", cells: [] });
grid.render();

// Buttons
document.getElementById("button-toggle")?.addEventListener("click", () => {
  if (toggle === "stop") {
    grid.tickLoop("start", animationGameOfLife);
    toggle = "start";
  } else if (toggle === "start") {
    grid.tickLoop("stop", animationGameOfLife);
    toggle = "stop";
  } else {
    throw Error("Unknown toggle.");
  }
});

document.getElementById("button-speed-up")?.addEventListener("click", () => {
  const infoSpeedMult = document.getElementById("info-speed-multiplier");

  grid.speedMultiplier = grid.speedMultiplier * 2;

  if (infoSpeedMult !== null)
    infoSpeedMult.textContent = `Speed Multiplier: ${grid.speedMultiplier}x`;
});

document.getElementById("button-slow-down")?.addEventListener("click", () => {
  const infoSpeedMult = document.getElementById("info-speed-multiplier");

  grid.speedMultiplier = grid.speedMultiplier / 2;

  if (infoSpeedMult !== null)
    infoSpeedMult.textContent = `Speed Multiplier: ${grid.speedMultiplier}x`;
});

document
  .getElementById("button-clean-canvas")
  ?.addEventListener("click", () => {
    resetCanvas();
    applyPatternToCanvas({ name: "Blank canvas", cells: [] });
    grid.render();
  });

// Canvas handler
const patterns = PATTERNS;

const listOfPatterns = document.getElementById("patterns-list");

if (listOfPatterns === null) {
  throw Error("No list of patterns <ul> found.");
}

for (const pattern of patterns) {
  const element = document.createElement("li");
  const content = document.createElement("span");
  const buttonApply = document.createElement("button");

  content.textContent = pattern.name;

  buttonApply.className = "patterns-list-button-apply";
  buttonApply.addEventListener("click", () => {
    resetCanvas();
    applyPatternToCanvas(pattern);
    grid.render();
  });
  buttonApply.textContent = "Apply";

  element.appendChild(content);
  element.appendChild(buttonApply);

  listOfPatterns.appendChild(element);
}
