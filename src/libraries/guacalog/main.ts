/* TS */
import * as FS from "fs";

type Level = "info" | "debug" | "warn" | "error";

interface Counter {
  info: number;
  debug: number;
  warn: number;
  error: number;
}

/* GLOBALS */

const tagLevelColors = {
  info: "\x1b[1;39m",
  debug: "\x1b[1;32m",
  warn: "\x1b[1;33m",
  error: "\x1b[1;31m",
  reset: "\x1b[0m",
};

/* CLASS */

/**
 * Singleton logger that writes colorized console output and optionally persists logs to a file,
 * tracking counts per level for post-mortem reporting.
 */
class GuacaLog {
  static #instance: GuacaLog | undefined = undefined;
  static #instantiatedByClass: boolean = true;

  #logFileDescriptor: number | undefined;
  #counter: Counter = {
    info: 0,
    debug: 0,
    warn: 0,
    error: 0,
  };

  /**
   * Guarded constructor that only executes through the method `getInstance`.
   * @param filename Optional path to persist logs to.
   */
  constructor(filename: string | undefined = undefined) {
    if (GuacaLog.#instantiatedByClass) {
      throw new Error(
        "Private constructor, use GuacaLog.getInstance() to get the logger",
      );
    }

    if (filename !== undefined) {
      const now = new Date();
      const formattedNow = new Intl.DateTimeFormat("fr", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      FS.writeFileSync(
        filename,
        `Logger initialized (${formattedNow.format(now)})\n`,
      );
      this.#logFileDescriptor = FS.openSync(filename, "a");
    }
  }

  /**
   * Returns the shared logger instance, creating it if necessary.
   * @param filename Optional log file path that is only honored on first call.
   */
  static getInstance(filename: string | undefined = undefined): GuacaLog {
    GuacaLog.#instantiatedByClass = false;
    if (GuacaLog.#instance === undefined) {
      GuacaLog.#instance = new GuacaLog(filename);
    }
    GuacaLog.#instantiatedByClass = true;

    return GuacaLog.#instance;
  }

  /**
   * Records a log entry to the console (with color) and optional file output.
   * @param level Severity level that controls formatting and counter tracking.
   * @param message Message payload which can be a string or structured object.
   */
  log(level: Level, message: string | object) {
    let logMessage = "placeholder";
    const now = new Date();
    const formattedNow = new Intl.DateTimeFormat("fr", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const url = import.meta.url;
    const sourcePath = url.substring(url.lastIndexOf("src/"));
    const spacing = "  ";

    const tagLevel = `[${level.toUpperCase()}]${spacing}`;
    const tagDate = `(${formattedNow.format(now)})${spacing}`;
    const tagFileSource = `(${sourcePath})`;

    if (typeof message === "string") {
      logMessage = `${spacing}-${spacing}${message}`;
    }
    if (typeof message === "object") {
      logMessage = `\n${JSON.stringify(message, null, 2)}`;
    }

    const loggedToConsole = `${tagLevelColors[level]}${tagLevel}${tagLevelColors.reset}${tagDate}${tagFileSource}${logMessage}`;
    const loggedToFile = `${tagLevel}${tagDate}${tagFileSource}${logMessage}`;

    if (this.#logFileDescriptor !== undefined) {
      FS.writeFileSync(this.#logFileDescriptor, loggedToFile + "\n", {
        flag: "a",
      });
    }
    console.log(loggedToConsole);
    this.#counter[level]++;
  }

  /**
   * Emits the aggregated counters for each log level.
   */
  counts() {
    this.log("info", `${this.#counter.info} log(s) tagged with info`);
    this.log("info", `${this.#counter.debug} log(s) tagged with debug`);
    this.log("info", `${this.#counter.warn} log(s) tagged with warn`);
    this.log("info", `${this.#counter.error} log(s) tagged with error`);
  }

  /**
   * Flushes the counters, closes the file descriptor, and resets the singleton.
   */
  close() {
    this.counts();

    if (this.#logFileDescriptor !== undefined) {
      FS.closeSync(this.#logFileDescriptor);
    }

    GuacaLog.#instance = undefined;
  }
}

export { GuacaLog };
