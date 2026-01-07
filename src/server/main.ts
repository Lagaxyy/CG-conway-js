import express from "express";
import GuacaLog from "../libraries/guacalog/main";
// import path from "path";
// import url from "url";

const logger = GuacaLog.getInstance("cgconway.log");
const host = "localhost";
const port = 3000;
// const dirname = path.dirname(url.fileURLToPath(import.meta.url));

const request = (res: express.Response, exec: () => void) => {
  try {
    exec();
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));

    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const app = express();
app.use(express.json());

app.get("/", (_, res) =>
  request(res, () => {
    res.status(200).send({ message: "Hello world!" });
  }),
);

app.listen(port, host, () => {
  // console.log(`Server running at http://${host}:${port}`);
  logger.log(
    import.meta.url,
    "info",
    `Server running at http://${host}:${port}`,
  );
});
