import type { Logger } from "../../src/core/index.ts";

const silentLogger: Logger = {
    info: () => {},
    warn: () => {},
    error: () => {},
};

export default silentLogger;
