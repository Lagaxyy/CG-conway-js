import * as INTERFACE from "./interface/interface";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * ms));
}

const asyncScript = async () => {
  await INTERFACE.createApp();

  INTERFACE.showInfo();

  INTERFACE.changeCellStateByIndex(5, "alive");
  INTERFACE.changeCellStateByIndex(2047, "alive");
  INTERFACE.renderCells();

  INTERFACE.changeCellStateByIndex(1, "alive");
  INTERFACE.animationRightShift("start");

  await sleep(5);
  INTERFACE.animationRightShift("stop");

  await sleep(3);
  INTERFACE.animationRightShift("start");

  await sleep(4);
  INTERFACE.animationRightShift("destroy");
};

asyncScript();
