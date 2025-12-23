/**
 * TODO:
 *    - add color to level tags
 *    - log to file if specified
 */

/* TS */

type Level = "trace" | "debug" | "warn" | "error";

interface Counter {
  trace: number;
  debug: number;
  warn: number;
  error: number;
}

class GuacaLog {
  static #instance: GuacaLog | undefined = undefined;
  static #instantiatedByClass: boolean = true;

  #logFilename: string | undefined;
  #counter: Counter = {
    trace: 0,
    debug: 0,
    warn: 0,
    error: 0,
  };

  constructor(filename: string | undefined = undefined) {
    if (GuacaLog.#instantiatedByClass) {
      throw new Error(
        "Private constructor, use GuacaLog.getInstance() to get the logger",
      );
    }

    this.#logFilename = filename;
  }

  static getInstance(filename: string | undefined = undefined): GuacaLog {
    GuacaLog.#instantiatedByClass = false;
    if (GuacaLog.#instance === undefined) {
      GuacaLog.#instance = new GuacaLog(filename);
    }
    GuacaLog.#instantiatedByClass = true;

    return GuacaLog.#instance;
  }

  log(level: Level, message: string | object) {
    const now = new Date();
    const formattedNow = new Intl.DateTimeFormat("fr", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const url = import.meta.url;
    const sourcePath = url.substring(url.lastIndexOf("src/"));

    if (typeof message === "string") {
      console.log(
        `[${level.toUpperCase()}] (${formattedNow.format(now)}) (${sourcePath}) - ${message}`,
      );
    }
    if (typeof message === "object") {
      console.log(
        `[${level.toUpperCase()}] (${formattedNow.format(now)}) (${sourcePath})`,
      );
      console.log(JSON.stringify(message, null, 2));
    }
    this.#counter[level]++;
  }

  counts() {
    console.log("trace: ", this.#counter.trace);
    console.log("debug: ", this.#counter.debug);
    console.log("warn: ", this.#counter.warn);
    console.log("error: ", this.#counter.error);

    console.log(this.#logFilename);
  }
}

export { GuacaLog };

const test = GuacaLog.getInstance();
test.log("debug", "test message");
test.log("debug", { message: "another test message", value: 2 });

const instance = GuacaLog.getInstance();
instance.log("debug", "test with instance");

test.counts();
