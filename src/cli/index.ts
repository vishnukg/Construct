#!/usr/bin/env node
import composeApp from "../app/compose.ts";
import formatReport from "./formatReport.ts";

const app = composeApp();

try {
  const report = await app.getReport();
  console.log(formatReport(report));
} catch (caught) {
  console.error(
    caught instanceof Error ? caught.message : "Failed to load metrics",
  );
  process.exitCode = 1;
}
