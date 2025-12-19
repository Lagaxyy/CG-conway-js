import {
  Application,
  Container,
  Graphics,
  GraphicsContext,
  Renderer,
} from "pixi.js";

type CELL_STATE = "alive" | "dead";

let APP: Application<Renderer>;
const CELL_SIZE = 25;
const CELL_COLOR_LIGHT = 0x525252;
const CELL_COLOR_DARK = 0x28282b;
const CELLS: CELL_STATE[] = Array<CELL_STATE>();

export async function createApp(): Promise<Application<Renderer> | undefined> {
  const frames = {
    cellDead: new GraphicsContext()
      .rect(0, 0, CELL_SIZE, CELL_SIZE)
      .fill(CELL_COLOR_LIGHT)
      .rect(1, 1, CELL_SIZE - 2, CELL_SIZE - 2)
      .fill(CELL_COLOR_DARK),
    cellAlive: new GraphicsContext()
      .rect(0, 0, CELL_SIZE, CELL_SIZE)
      .fill(CELL_COLOR_LIGHT),
  };

  // Retrieve pixi container div from the DOM
  const pixiContainer = document.getElementById("pixi-container");
  if (pixiContainer === null) {
    console.error("Error retrieving pixi container");
    return;
  }

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#000000", resizeTo: pixiContainer });

  // Append the application canvas to the document body
  pixiContainer.appendChild(app.canvas);

  // Create content container and set it in the center
  const container = new Container();
  app.stage.addChild(container);

  // Create grid of dead cells and add it to the container
  for (let i = 0; i < app.screen.height / CELL_SIZE; i++) {
    for (let j = 0; j < app.screen.width / CELL_SIZE; j++) {
      const dc = new Graphics(frames.cellDead);

      dc.x = j * CELL_SIZE;
      dc.y = i * CELL_SIZE;

      container.addChild(dc);
      CELLS.push("dead");
    }
  }

  APP = app;

  return app;
}

export async function addStartingCells() {
  // TODO: Add random alive cells
  return APP;
}
