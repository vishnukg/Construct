#!/usr/bin/env node
import makeSampleDevmetricsSource from "../app/adapters/devmetrics/makeSampleDevmetricsSource.ts";
import makeRuleBasedInsightEngine from "../app/adapters/insights/makeRuleBasedInsightEngine.ts";
import makeConsoleLogger from "../app/adapters/logger/makeConsoleLogger.ts";
import composeCliApp from "./compose.ts";

const source = makeSampleDevmetricsSource();
const insightEngine = makeRuleBasedInsightEngine();
const logger = makeConsoleLogger();

const { cli } = composeCliApp({ source, insightEngine, logger });

try {
  console.log(await cli.run());
} catch (caught) {
  console.error(
    caught instanceof Error ? caught.message : "Failed to load metrics",
  );
  process.exitCode = 1;
}
