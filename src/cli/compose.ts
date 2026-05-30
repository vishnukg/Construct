import { makeDevmetrics } from "../app/core/index.ts";
import type {
  Logger,
  DevmetricsSource,
  InsightEngine,
} from "../app/core/index.ts";
import makeSampleDevmetricsSource from "../app/adapters/devmetrics/makeSampleDevmetricsSource.ts";
import makeRuleBasedInsightEngine from "../app/adapters/insights/makeRuleBasedInsightEngine.ts";
import makeNoOpLogger from "../app/adapters/logger/makeNoOpLogger.ts";

type CliAppCfg = {
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
};

const makeDefaultCliAppCfg = (): CliAppCfg => ({
  source: makeSampleDevmetricsSource(),
  insightEngine: makeRuleBasedInsightEngine(),
  logger: makeNoOpLogger(),
});

const composeCliApp = (cfg: CliAppCfg = makeDefaultCliAppCfg()) => {
  const { source, insightEngine, logger } = cfg;
  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};

export default composeCliApp;
