import { makeDeveloperMetrics } from "../core/index.ts";
import type { Logger, DeveloperMetricsSource, InsightEngine } from "../core/index.ts";

type CliAppCfg = {
    source: DeveloperMetricsSource;
    insightEngine: InsightEngine;
    logger: Logger;
};

const composeCliApp = ({ source, insightEngine, logger }: CliAppCfg) => {
    const getReport = makeDeveloperMetrics({ source, insightEngine, logger });

    return { getReport };
};

export default composeCliApp;
