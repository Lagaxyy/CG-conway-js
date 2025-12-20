import {
  Application,
  Container,
  Graphics,
  GraphicsContext,
  Renderer,
  Ticker,
} from "pixi.js";

/* TS */

type CELL_STATE = "alive" | "dead";
type ANIMATION_ACTION = "start" | "stop" | "destroy";

interface Cell {
  index: number;
  state: CELL_STATE;
  updated: boolean;
}

/* GLOBALS */

let APP: Application<Renderer>;
const CELL_SIZE = 25;
const CELL_COLOR_LIGHT = 0x525252;
const CELL_COLOR_DARK = 0x28282b;
const CELLS: Array<Cell>[] = [];
const FRAMES = {
  cells: {
    dead: new GraphicsContext()
      .rect(0, 0, CELL_SIZE, CELL_SIZE)
      .fill(CELL_COLOR_LIGHT)
      .rect(1, 1, CELL_SIZE - 2, CELL_SIZE - 2)
      .fill(CELL_COLOR_DARK),
    alive: new GraphicsContext()
      .rect(0, 0, CELL_SIZE, CELL_SIZE)
      .fill(CELL_COLOR_LIGHT),
  },
};
const LABEL_MAIN_CONTAINER = "main";
const TICKERS: Record<string, Ticker> = {};

/* HELPERS */

const boundIndex = (index: number, value: number, limit: number): number => {
  if (index + value >= limit) {
    return index + value - limit;
  }
  if (index + value < 0) {
    return limit - index + value;
  }

  return index + value;
};

/* FUNCTIONS */
export function showInfo() {
  const width = APP.screen.width;
  const height = APP.screen.height;
  const pwidth = width / CELL_SIZE;
  const pheight = height / CELL_SIZE;

  console.log(`cell size: ${CELL_SIZE}`);
  console.log(`app screen width: ${width}`);
  console.log(`app screen height: ${height}`);
  console.log(`app screen pixel width: ${pwidth}`);
  console.log(`app screen pixel height: ${pheight}`);
  console.log(`total pixels: ${pwidth * pheight}`);
}

export function renderCells() {
  // Walk the cached cell grid and redraw each sprite based on the latest state.
  for (let i = 0; i < CELLS.length; i++) {
    const cellRow = CELLS[i];

    for (let j = 0; j < cellRow.length; j++) {
      const cell: Cell = cellRow[j];

      // Check if cell needs to be updated
      if (cell.updated) continue;

      // Retrieve main container and cell to update, create updated cell
      const container = APP.stage.getChildByLabel(LABEL_MAIN_CONTAINER);
      const cellOld = container?.getChildAt(cell.index);
      const cellNew = new Graphics(FRAMES.cells[cell.state]);

      // Check if old cell exists
      if (cellOld === undefined) {
        console.log(`No cell found for index ${cell.index}`);
        continue;
      }

      // Replace old cell by new cell
      container?.replaceChild(cellOld, cellNew);

      // Change update state of cell
      cell.updated = true;
    }
  }
}

export async function createApp() {
  let cellsIndex = 0;

  // Retrieve pixi container div from the DOM
  const pixiContainer = document.getElementById("pixi-container");
  if (pixiContainer === null) {
    // TEMP ERROR HANDLING
    console.error("Error retrieving pixi container");
    return;
  }

  // Create a new application
  APP = new Application();

  // Initialize the application
  await APP.init({ background: "#000000", resizeTo: pixiContainer });

  // Append the application canvas to the document body
  pixiContainer.appendChild(APP.canvas);

  // Create the main container that will host the entire cell grid.
  const container = new Container({ label: LABEL_MAIN_CONTAINER });
  APP.stage.addChild(container);

  // Populate the container with a uniform grid of dead cells and track each as a Cell.
  for (let i = 0; i < APP.screen.height / CELL_SIZE; i++) {
    const cellRow: Cell[] = [];

    for (let j = 0; j < APP.screen.width / CELL_SIZE; j++) {
      const dc = new Graphics(FRAMES.cells["dead"]);

      dc.x = j * CELL_SIZE;
      dc.y = i * CELL_SIZE;

      container.addChild(dc);
      cellRow.push({ index: cellsIndex, state: "dead", updated: true });
      cellsIndex++;
    }

    CELLS.push(cellRow);
  }
}

export function changeCellStateByIndex(index: number, state: CELL_STATE) {
  // Mark the requested cell as specified state so the next render pass replaces its Graphics.
  for (let i = 0; i < CELLS.length; i++) {
    const cellRow = CELLS[i];

    for (let j = 0; j < cellRow.length; j++) {
      const cell: Cell = cellRow[j];

      if (cell.index === index) {
        cell.state = state;
        cell.updated = false;
      }
    }
  }
}

export function changeCellStateByMatrixIndexes(
  i: number,
  j: number,
  state: CELL_STATE,
) {
  // Mark the requested cell as specified state so the next render pass replaces its Graphics.
  if (CELLS.length === 0 || i >= CELLS.length || j >= CELLS[0].length) {
    console.error("Couldn't change cell state with matrix indexes");
    return;
  }

  const cell: Cell = CELLS[i][j];

  cell.state = state;
  cell.updated = false;
}

export function animationRightShift(action: ANIMATION_ACTION) {
  const animate = () => {
    for (let i = 0; i < CELLS.length; i++) {
      const cellRow = CELLS[i];

      for (let j = 0; j < cellRow.length; j++) {
        const cell: Cell = cellRow[j];

        if (cell.updated && cell.state === "alive") {
          changeCellStateByMatrixIndexes(
            i,
            boundIndex(j, 1, cellRow.length),
            "alive",
          );
          changeCellStateByIndex(cell.index, "dead");
        }
      }
    }

    renderCells();
  };

  if (action === "start") {
    if (TICKERS.rightShift === undefined) {
      TICKERS.rightShift = new Ticker();
      TICKERS.rightShift.add(animate);
    }
    TICKERS.rightShift.start();
  }
  if (action === "stop" && TICKERS.rightShift !== undefined) {
    TICKERS.rightShift.stop();
  }
  if (action === "destroy" && TICKERS.rightShift !== undefined) {
    TICKERS.rightShift.destroy();
  }
}

// TODO: simple animation, with run and stop buttons
