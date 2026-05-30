import type { Devmetric, Insight } from "../domain/devmetrics/types.ts";

export interface InsightEngine {
  summarize: (metrics: Devmetric[]) => Promise<Insight[]>;
}
