import { makeDevmetrics } from "../app/core/index.ts";
import type {
  DevmetricsSource,
  InsightEngine,
  Logger,
} from "../app/core/index.ts";
import makeSampleDevmetricsSource from "../app/adapters/devmetrics/makeSampleDevmetricsSource.ts";
import makeRuleBasedInsightEngine from "../app/adapters/insights/makeRuleBasedInsightEngine.ts";
import makeNoOpLogger from "../app/adapters/logger/makeNoOpLogger.ts";

type UiAppCfg = {
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
};

const makeDefaultUiAppCfg = (): UiAppCfg => ({
  source: makeSampleDevmetricsSource(),
  insightEngine: makeRuleBasedInsightEngine(),
  logger: makeNoOpLogger(),
});

const composeUiApp = (cfg: UiAppCfg = makeDefaultUiAppCfg()) => {
  const { source, insightEngine, logger } = cfg;
  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};

export default composeUiApp;
