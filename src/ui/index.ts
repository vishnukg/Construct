import "./styles.css";
import makeSampleDevmetricsSource from "../app/adapters/devmetrics/makeSampleDevmetricsSource.ts";
import makeRuleBasedInsightEngine from "../app/adapters/insights/makeRuleBasedInsightEngine.ts";
import makeConsoleLogger from "../app/adapters/logger/makeConsoleLogger.ts";
import composeUiApp from "./compose.ts";

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("Missing #app root");
}

const source = makeSampleDevmetricsSource();
const insightEngine = makeRuleBasedInsightEngine();
const logger = makeConsoleLogger();

const { renderApp } = composeUiApp({
  root: appRoot,
  source,
  insightEngine,
  logger,
});
void renderApp();
