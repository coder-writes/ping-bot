import RenderUrl from "../models/url.js";
import {
  AppError,
  getHealthProbe,
  normalizeRenderUrl,
} from "../services/render-url.service.js";

const duplicateUrlMessage = "This URL is already registered.";
const maxUrlsPerIp = 5;

export const registerRenderUrl = async (req, res, next) => {
  try {
    const { renderUrl } = req.body ?? {};
    const normalized = normalizeRenderUrl(renderUrl);
    const requestIp = req.ip || req.socket?.remoteAddress || "unknown";

    const activeUrlsFromIp = await RenderUrl.countDocuments({
      createdFromIp: requestIp,
      isActive: true,
    });

    if (activeUrlsFromIp >= maxUrlsPerIp) {
      throw new AppError(429, "Too many active URLs are registered from this IP.", {
        renderUrl: `You can register up to ${maxUrlsPerIp} active URLs from this IP address.`,
      });
    }

    const existingUrl = await RenderUrl.findOne({
      normalizedUrl: normalized.normalizedUrl,
    }).lean();

    if (existingUrl) {
      throw new AppError(409, duplicateUrlMessage, {
        renderUrl: duplicateUrlMessage,
      });
    }

    const probe = await getHealthProbe(normalized.healthUrl);

    const createdUrl = await RenderUrl.create({
      originalUrl: normalized.originalUrl,
      normalizedUrl: normalized.normalizedUrl,
      healthUrl: normalized.healthUrl,
      host: normalized.host,
      createdFromIp: requestIp,
      isActive: true,
      lastPingedAt: new Date(),
      lastHealthyAt: new Date(),
      lastStatusCode: probe.statusCode,
      failureCount: 0,
      lastError: null,
      pingIntervalMinutes: 2,
    });

    return res.status(201).json({
      success: true,
      message: "URL verified and scheduled for keepalive pings.",
      data: {
        id: createdUrl._id,
        renderUrl: createdUrl.originalUrl,
        healthUrl: createdUrl.healthUrl,
        lastStatusCode: createdUrl.lastStatusCode,
        pingIntervalMinutes: createdUrl.pingIntervalMinutes,
      },
      error: null,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return next(new AppError(409, duplicateUrlMessage, {
        renderUrl: duplicateUrlMessage,
      }));
    }

    return next(error);
  }
};

export const getAllRenderUrls = async (req, res, next) => {
  try {
    const requestIp = req.ip || req.socket?.remoteAddress || "unknown";

    // Filtering by IP for privacy/safety
    const urls = await RenderUrl.find({
      createdFromIp: requestIp,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved registered URLs.",
      data: urls,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteRenderUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestIp = req.ip || req.socket?.remoteAddress || "unknown";

    const url = await RenderUrl.findOne({
      _id: id,
      createdFromIp: requestIp, // Safety check to ensure user deletes their own entries
    });

    if (!url) {
      throw new AppError(404, "URL registration not found or unauthorized.");
    }

    await RenderUrl.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "URL registration removed successfully.",
      data: null,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
};
