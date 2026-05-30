import type { Logger } from "../../core/index.ts";

const consoleLogger: Logger = {
  info: (message, data) => console.info(message, data ?? ""),
  warn: (message, data) => console.warn(message, data ?? ""),
  error: (message, data) => console.error(message, data ?? ""),
};

export default consoleLogger;
