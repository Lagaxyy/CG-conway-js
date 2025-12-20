import * as INTERFACE from "./interface/interface";

const asyncScript = async () => {
  await INTERFACE.createApp();

  INTERFACE.showInfo();

  INTERFACE.addCellByIndex(5);
  INTERFACE.addCellByIndex(2047);
  INTERFACE.renderCells();
};

asyncScript();
