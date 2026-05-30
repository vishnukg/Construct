import type { Logger } from "../../src/app/core/index.ts";

const silentLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

export default silentLogger;
