import type { Logger } from "../../core/index.ts";

const consoleLogger: Logger = {
    info: (message, data) => console.error(message, data ?? ""),
    warn: (message, data) => console.error(message, data ?? ""),
    error: (message, data) => console.error(message, data ?? ""),
};

export default consoleLogger;
