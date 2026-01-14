import express from "express";
import dotenv from "dotenv";

import GuacaLog from "../libraries/guacalog/main";

const logger = GuacaLog.getInstance("cgconway.log");
const host = "localhost";
const port = 3000;

const request = (res: express.Response, exec: () => void) => {
  try {
    exec();
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    const stack = error.stack !== undefined ? error.stack : error.message;

    logger.log(import.meta.url, "error", stack);
    res.status(500).send({ message: error.message });
  }
};

dotenv.config({ path: "secret.env" });
const secretKey = process.env.SECRET_KEY;

if (secretKey == undefined) {
  throw Error("No secret key defined.");
}

const app = express();
app.use(express.json());
app.use(express.static("./dist/browser"));

app.post("/log", (req, res) =>
  request(res, () => {
    logger.log(import.meta.url, "debug", req.body);
    logger.log(import.meta.url, "debug", secretKey);
    res.status(200).send({ success: "true" });
  }),
);

app.listen(port, host, () => {
  logger.log(
    import.meta.url,
    "info",
    `Server running at http://${host}:${port}`,
  );
});
