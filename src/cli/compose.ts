import { makeDevmetrics } from "../core/index.ts";
import type { Logger, DevmetricsSource, InsightEngine } from "../core/index.ts";

type CliAppCfg = {
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
};

const composeCliApp = ({ source, insightEngine, logger }: CliAppCfg) => {
  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};

export default composeCliApp;
