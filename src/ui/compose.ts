import { makeDevmetrics } from "../app/core/index.ts";
import type {
  DevmetricsSource,
  InsightEngine,
  Logger,
} from "../app/core/index.ts";
import makeRenderApp from "./render/renderApp.ts";

type UiAppCfg = {
  root: HTMLElement;
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
};

const composeUiApp = ({ root, source, insightEngine, logger }: UiAppCfg) => {
  const getReport = makeDevmetrics({ source, insightEngine, logger });
  const renderApp = makeRenderApp(root, getReport);

  return { renderApp };
};

export default composeUiApp;
