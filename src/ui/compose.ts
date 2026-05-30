import { makeDevmetrics } from "../app/core/index.ts";
import type {
  DevmetricsSource,
  InsightEngine,
  Logger,
} from "../app/core/index.ts";

type UiAppCfg = {
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
};

const composeUiApp = ({ source, insightEngine, logger }: UiAppCfg) => {
  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};

export default composeUiApp;
