import type { DeveloperMetric } from "../domain/developerMetrics/types.ts";

export interface DeveloperMetricsSource {
    listMetrics: () => Promise<DeveloperMetric[]>;
}
