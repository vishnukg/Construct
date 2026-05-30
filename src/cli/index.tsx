#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import composeCliApp from "./compose.ts";
import makeSampleDeveloperMetricsSource from "../adapters/developerMetrics/makeSampleDeveloperMetricsSource.ts";
import makeRuleBasedInsightEngine from "../adapters/insights/makeRuleBasedInsightEngine.ts";
import consoleLogger from "../adapters/logger/consoleLogger.ts";
import App from "./components/App.tsx";

const app = composeCliApp({
    source: makeSampleDeveloperMetricsSource(),
    insightEngine: makeRuleBasedInsightEngine(),
    logger: consoleLogger,
});

render(<App getReport={app.getReport} />);
