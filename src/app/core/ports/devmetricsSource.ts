import type { Devmetric } from "../domain/devmetrics/types.ts";

export interface DevmetricsSource {
  listMetrics: () => Promise<Devmetric[]>;
}
