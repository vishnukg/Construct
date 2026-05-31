import { makeDevmetrics } from "../app/core/index.ts";
import type {
  Logger,
  DevmetricsSource,
  InsightEngine,
} from "../app/core/index.ts";
import makeSampleDevmetricsSource from "../app/adapters/devmetrics/makeSampleDevmetricsSource.ts";
import makeRuleBasedInsightEngine from "../app/adapters/insights/makeRuleBasedInsightEngine.ts";
import consoleLogger from "../app/adapters/logger/consoleLogger.ts";

type AppCfg = {
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
};

const makeDefaultCfg = (): AppCfg => ({
  source: makeSampleDevmetricsSource(),
  insightEngine: makeRuleBasedInsightEngine(),
  logger: consoleLogger,
});

const composeApp = (cfg: AppCfg = makeDefaultCfg()) => {
  const { source, insightEngine, logger } = cfg;
  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};

export default composeApp;
