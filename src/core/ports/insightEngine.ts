import type { DeveloperMetric, Insight } from "../domain/developerMetrics/types.ts";

export interface InsightEngine {
    summarize: (metrics: DeveloperMetric[]) => Promise<Insight[]>;
}
