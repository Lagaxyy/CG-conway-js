import { CellGrid } from "./cellGrid/cellGrid";

const boundIndex = (index: number, value: number, limit: number): number => {
  if (index + value >= limit) {
    return index + value - limit;
  }
  if (index + value < 0) {
    return limit - index + value;
  }

  return index + value;
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * ms));
}

const animationRightShift = (grid: CellGrid) => {
  for (let i = 0; i < grid.cells.length; i++) {
    const cellRow = grid.cells[i];

    for (let j = 0; j < cellRow.length; j++) {
      const cell = cellRow[j];

      if (cell.updated && cell.state === "alive") {
        grid.changeCellStateByMatrixIndexes(
          i,
          boundIndex(j, 1, cellRow.length),
          "alive",
        );
        grid.changeCellStateByIndex(cell.index, "dead");
      }
    }
  }

  grid.render();
};

const asyncScript = async () => {
  const grid = new CellGrid();

  await grid.init();

  grid.changeCellStateByIndex(5, "alive");
  grid.changeCellStateByIndex(2047, "alive");
  grid.render();

  grid.changeCellStateByIndex(1, "alive");
  grid.tickLoop("start", animationRightShift);

  await sleep(5);
  grid.tickLoop("stop", animationRightShift);

  await sleep(3);
  grid.tickLoop("start", animationRightShift);

  await sleep(4);
  grid.tickLoop("destroy", animationRightShift);
};

asyncScript();
