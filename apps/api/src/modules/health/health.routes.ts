import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/live", (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "alive" },
  });
});

healthRouter.get("/ready", (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "ready" },
  });
});
