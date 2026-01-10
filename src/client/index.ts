import CellGrid from "./cellGrid/cellGrid";
import Patterns from "../../patterns.json";

/* TS */

interface WaitingCell {
  i: number;
  j: number;
  state: string;
}

/* GLOBALS */

const PATTERNS = [
  Patterns.spaceship.glider,
  Patterns.spaceship.lwss,
  Patterns.oscillator.pulsar,
];
let currentPattern = 0;

/* HELPERS */

const boundIndex = (index: number, value: number, limit: number): number => {
  if (index + value < 0) {
    return (((index + value) % limit) + limit) % limit;
  }

  return (index + value) % limit;
};

/* SCRIPT */

document.getElementById("button-test")?.addEventListener("click", async () => {
  try {
    const response = await fetch("/test");
    const data = await response.json();
    const result = document.getElementById("result");

    if (result !== null) {
      result.textContent = "Result: " + JSON.stringify(data);
    }
  } catch (e) {
    console.error(e);
  }
});

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
    if (cell.state !== "alive" && cell.state !== "dead")
      throw Error("Wrong cell state indicated");
    grid.changeCellStateByMatrixIndexes(cell.i, cell.j, cell.state);
  }

  grid.render();
};

const patternApply = (patternCells: Array<{ i: number; j: number }>) => {
  for (const cell of patternCells) {
    grid.changeCellStateByMatrixIndexes(cell.i, cell.j, "alive");
  }
};

const patternClean = () => {
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

const animationGameOfLife = {
  name: "animationGameOfLife",
  run: gameOfLife,
};

const grid = new CellGrid();
await grid.init();

patternApply(PATTERNS[currentPattern]);
grid.render();

document.getElementById("button-start")?.addEventListener("click", () => {
  grid.tickLoop("start", animationGameOfLife);
});

document.getElementById("button-stop")?.addEventListener("click", () => {
  grid.tickLoop("stop", animationGameOfLife);
});

document.getElementById("button-speed-up")?.addEventListener("click", () => {
  grid.speedMultiplier = grid.speedMultiplier * 2;
});

document.getElementById("button-slow-down")?.addEventListener("click", () => {
  grid.speedMultiplier = grid.speedMultiplier / 2;
});

document
  .getElementById("button-switch-pattern")
  ?.addEventListener("click", () => {
    patternClean();
    grid.tickLoop("destroy", animationGameOfLife);
    currentPattern = boundIndex(currentPattern, 1, PATTERNS.length);
    patternApply(PATTERNS[currentPattern]);
    grid.render();
  });
