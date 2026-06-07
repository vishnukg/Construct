import { makeDevmetrics } from "./core/index.ts";
import type {
  Logger,
  DevmetricsSource,
  InsightEngine,
} from "./core/index.ts";
import makeSampleDevmetricsSource from "./adapters/devmetrics/makeSampleDevmetricsSource.ts";
import makeRuleBasedInsightEngine from "./adapters/insights/makeRuleBasedInsightEngine.ts";
import consoleLogger from "./adapters/logger/consoleLogger.ts";

export type AppCfg = {
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
};

// The single composition root for the app. Both entry points (cli, ui) reuse it,
// so adapter selection and domain wiring live in one place — they differ only in
// how they present the report (formatReport vs renderApp), which stays in each
// index.ts. Choosing the concrete adapters is the composition root's job, so the
// defaults are selected here; pass a partial cfg to override any of them (e.g. in
// tests).
const composeApp = (cfg: Partial<AppCfg> = {}) => {
  const source        = cfg.source        ?? makeSampleDevmetricsSource();
  const insightEngine = cfg.insightEngine ?? makeRuleBasedInsightEngine();
  const logger        = cfg.logger        ?? consoleLogger;

  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};

export default composeApp;
