import CellGrid from "./cellGrid/cellGrid";
import sleep from "../libraries/sleep/main";

/* TS */

interface WaitingCell {
  i: number;
  j: number;
  state: string;
}

/* GLOBALS */

/* HELPERS */

const boundIndex = (index: number, value: number, limit: number): number => {
  if (index + value < 0) {
    return (((index + value) % limit) + limit) % limit;
  }

  return (index + value) % limit;
};

// const animationRightShift = (grid: CellGrid) => {
//   for (let i = 0; i < grid.cells.length; i++) {
//     const cellRow = grid.cells[i];

//     for (let j = 0; j < cellRow.length; j++) {
//       const cell = cellRow[j];

//       if (cell.rendered && cell.state === "alive") {
//         grid.changeCellStateByMatrixIndexes(
//           i,
//           boundIndex(j, 1, cellRow.length),
//           "alive",
//         );
//         grid.changeCellStateByIndex(cell.index, "dead");
//       }
//     }
//   }

//   grid.render();
// };

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

const gameOfLife = async (grid: CellGrid) => {
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

const asyncScript = async () => {
  const animationGameOfLife = {
    name: "animationGameOfLife",
    run: gameOfLife,
  };

  const grid = new CellGrid();

  await grid.init();

  grid.changeCellStateByMatrixIndexes(5, 3, "alive");
  grid.changeCellStateByMatrixIndexes(5, 4, "alive");
  grid.changeCellStateByMatrixIndexes(5, 5, "alive");
  grid.changeCellStateByMatrixIndexes(4, 5, "alive");
  grid.changeCellStateByMatrixIndexes(3, 4, "alive");
  grid.render();

  await sleep(2);

  grid.tickLoop("start", animationGameOfLife);
  await sleep(20);
  grid.tickLoop("destroy", animationGameOfLife);
};

asyncScript();
