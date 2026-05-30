import "./styles.css";
import composeUiApp from "./compose.ts";
import renderReport from "./renderReport.ts";

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("Missing #app root");
}

const app = composeUiApp();

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
