import cron from "node-cron";

import RenderUrl from "../models/url.js";
import { AppError, pingRenderHealth } from "./render-url.service.js";

const SCHEDULE_EXPRESSION = "*/2 * * * *";
const MAX_FAILURES_BEFORE_DISABLE = 3;
const MAX_CONCURRENCY = 5;

let schedulerStarted = false;
let jobRunning = false;

const chunk = (items, size) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const updateUrlAfterSuccess = async (urlDocument, result) => {
  await RenderUrl.updateOne(
    { _id: urlDocument._id },
    {
      $set: {
        lastPingedAt: new Date(),
        lastHealthyAt: new Date(),
        lastStatusCode: result.statusCode,
        failureCount: 0,
        lastError: null,
        isActive: true,
      },
    },
  );
};

const updateUrlAfterFailure = async (urlDocument, error) => {
  const failureCount = (urlDocument.failureCount || 0) + 1;
  const shouldDisable = failureCount >= MAX_FAILURES_BEFORE_DISABLE;

  await RenderUrl.updateOne(
    { _id: urlDocument._id },
    {
      $set: {
        lastPingedAt: new Date(),
        lastError: error.message,
        lastStatusCode: error.statusCode || null,
        failureCount,
        isActive: !shouldDisable,
      },
    },
  );
};

const processPingBatch = async (urlBatch) => {
  await Promise.allSettled(
    urlBatch.map(async (urlDocument) => {
      try {
        const result = await pingRenderHealth(urlDocument.healthUrl);
        await updateUrlAfterSuccess(urlDocument, result);
      } catch (error) {
        const normalizedError =
          error instanceof AppError
            ? error
            : new AppError(502, "Keepalive ping failed.", { healthUrl: error.message });

        await updateUrlAfterFailure(urlDocument, normalizedError);
      }
    }),
  );
};

const runKeepAliveCycle = async () => {
  if (jobRunning) {
    return;
  }

  jobRunning = true;

  try {
    const activeUrls = await RenderUrl.find({ isActive: true })
      .select("_id healthUrl failureCount")
      .lean();

    if (!activeUrls.length) {
      return;
    }

    const batches = chunk(activeUrls, MAX_CONCURRENCY);

    for (const urlBatch of batches) {
      await processPingBatch(urlBatch);
    }
  } catch (error) {
    console.error("Keepalive cycle failed:", error);
  } finally {
    jobRunning = false;
  }
};

export const startKeepAliveScheduler = () => {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  cron.schedule(SCHEDULE_EXPRESSION, runKeepAliveCycle, {
    timezone: process.env.CRON_TIMEZONE || "UTC",
  });

  void runKeepAliveCycle();
};
