import "./styles.css";
import makeSampleDevmetricsSource from "../app/adapters/devmetrics/makeSampleDevmetricsSource.ts";
import makeRuleBasedInsightEngine from "../app/adapters/insights/makeRuleBasedInsightEngine.ts";
import makeNoOpLogger from "../app/adapters/logger/makeNoOpLogger.ts";
import composeUiApp from "./compose.ts";
import renderReport from "./renderReport.ts";

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("Missing #app root");
}

const app = composeUiApp({
  source: makeSampleDevmetricsSource(),
  insightEngine: makeRuleBasedInsightEngine(),
  logger: makeNoOpLogger(),
});

const renderApp = async () => {
  appRoot.dataset.state = "loading";

  try {
    const report = await app.getReport();
    renderReport(appRoot, report, renderApp);
    appRoot.dataset.state = "ready";
  } catch (caught) {
    appRoot.dataset.state = "error";
    appRoot.textContent =
      caught instanceof Error ? caught.message : "Failed to load metrics";
  }
};

void renderApp();
