import type { Logger } from "../../core/index.ts";

const makeNoOpLogger = (): Logger => ({
    info: () => {},
    warn: () => {},
    error: () => {},
});

export default makeNoOpLogger;
