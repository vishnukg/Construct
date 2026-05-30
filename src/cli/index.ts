#!/usr/bin/env node
import composeCliApp from "./compose.ts";
import formatReport from "./formatReport.ts";
import makeSampleDevmetricsSource from "../app/adapters/devmetrics/makeSampleDevmetricsSource.ts";
import makeRuleBasedInsightEngine from "../app/adapters/insights/makeRuleBasedInsightEngine.ts";
import makeNoOpLogger from "../app/adapters/logger/makeNoOpLogger.ts";

const app = composeCliApp({
  source: makeSampleDevmetricsSource(),
  insightEngine: makeRuleBasedInsightEngine(),
  logger: makeNoOpLogger(),
});

try {
  const report = await app.getReport();
  console.log(formatReport(report));
} catch (caught) {
  console.error(
    caught instanceof Error ? caught.message : "Failed to load metrics",
  );
  process.exitCode = 1;
}
