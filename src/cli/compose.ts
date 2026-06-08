import { makeDevmetrics } from "../app/core/index.ts";
import type {
  DevmetricsSource,
  InsightEngine,
  Logger,
} from "../app/core/index.ts";
import formatReport from "./formatReport.ts";

type CliAppCfg = {
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
};

const composeCliApp = ({ source, insightEngine, logger }: CliAppCfg) => {
  const getReport = makeDevmetrics({ source, insightEngine, logger });

  const cli = {
    run: async () => formatReport(await getReport()),
  };

  return { cli };
};

export default composeCliApp;
