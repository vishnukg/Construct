import type { DevmetricsSource } from "../../core/index.ts";

const makeSampleDevmetricsSource = (): DevmetricsSource => ({
  listMetrics: async () => [
    {
      id: "dlt",
      label: "Delivery lead time",
      value: 3.8,
      unit: "days",
      target: 3,
      trend: "up",
      lowerIsBetter: true,
    },
    {
      id: "pr-wait",
      label: "PR wait time",
      value: 9.5,
      unit: "hours",
      target: 8,
      trend: "flat",
      lowerIsBetter: true,
    },
    {
      id: "review-time",
      label: "PR review time",
      value: 6.2,
      unit: "hours",
      target: 10,
      trend: "down",
      lowerIsBetter: true,
    },
    {
      id: "code-size",
      label: "Median PR size",
      value: 420,
      unit: "lines",
      target: 300,
      trend: "up",
      lowerIsBetter: true,
    },
    {
      id: "deploy-time",
      label: "Deployment time",
      value: 18,
      unit: "minutes",
      target: 20,
      trend: "down",
      lowerIsBetter: true,
    },
  ],
});

export default makeSampleDevmetricsSource;
