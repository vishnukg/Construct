import type { GetDevmetricsReportFn } from "../../app/core/index.ts";
import renderReport from "./renderReport.ts";

const makeRenderApp = (root: HTMLElement, getReport: GetDevmetricsReportFn) => {
  const renderApp = async () => {
    root.dataset.state = "loading";

    try {
      const report = await getReport();
      renderReport(root, report, renderApp);
      root.dataset.state = "ready";
    } catch (caught) {
      root.dataset.state = "error";
      root.textContent =
        caught instanceof Error ? caught.message : "Failed to load metrics";
    }
  };

  return renderApp;
};

export default makeRenderApp;
