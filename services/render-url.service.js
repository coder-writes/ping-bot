import validator from "validator";
import dns from "node:dns/promises";
import net from "node:net";

export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const normalizeHost = (hostname) => hostname.toLowerCase().replace(/\.$/, "");

const isPrivateIPv4 = (ip) => {
  const octets = ip.split(".").map(Number);

  if (octets.length !== 4 || octets.some(Number.isNaN)) {
    return true;
  }

  const [a, b] = octets;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 0
  );
};

const isPrivateIPv6 = (ip) => {
  const normalized = ip.toLowerCase();

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./.test(normalized) ||
    normalized === "::"
  );
};

const isPublicAddress = (address) => {
  const ipVersion = net.isIP(address);

  if (ipVersion === 4) {
    return !isPrivateIPv4(address);
  }

  if (ipVersion === 6) {
    return !isPrivateIPv6(address);
  }

  return false;
};

const assertHostResolvesToPublicAddress = async (hostname) => {
  const ipVersion = net.isIP(hostname);

  if (ipVersion && !isPublicAddress(hostname)) {
    throw new AppError(400, "Private and local network URLs are not allowed.", {
      renderUrl: "Use a publicly accessible URL.",
    });
  }

  if (ipVersion) {
    return;
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });

  if (!records.length || records.some((record) => !isPublicAddress(record.address))) {
    throw new AppError(400, "Private and local network URLs are not allowed.", {
      renderUrl: "Use a publicly accessible URL.",
    });
  }
};

export const normalizeRenderUrl = (inputUrl) => {
  if (typeof inputUrl !== "string") {
    throw new AppError(400, "renderUrl must be a string.", {
      renderUrl: "renderUrl must be a non-empty string.",
    });
  }

  const trimmedUrl = inputUrl.trim();

  if (!trimmedUrl) {
    throw new AppError(400, "renderUrl is required.", {
      renderUrl: "renderUrl is required.",
    });
  }

  if (
    !validator.isURL(trimmedUrl, {
      require_protocol: true,
      protocols: ["http", "https"],
      require_host: true,
      require_tld: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false,
      disallow_auth: true,
    })
  ) {
    throw new AppError(400, "Provide a valid absolute URL.", {
      renderUrl: "Provide a valid absolute URL with http or https.",
    });
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    throw new AppError(400, "Provide a valid absolute URL.", {
      renderUrl: "Provide a valid absolute URL with http or https.",
    });
  }

  const host = normalizeHost(parsedUrl.hostname);

  if (parsedUrl.username || parsedUrl.password) {
    throw new AppError(400, "Authenticated URLs are not allowed.", {
      renderUrl: "Do not include username or password in the URL.",
    });
  }

  if (parsedUrl.port) {
    throw new AppError(400, "Custom ports are not allowed.", {
      renderUrl: "Use the service URL without a custom port.",
    });
  }

  if (parsedUrl.search || parsedUrl.hash) {
    throw new AppError(400, "Do not include query strings or fragments.", {
      renderUrl: "Provide only the base Render service URL.",
    });
  }

  if (parsedUrl.pathname && parsedUrl.pathname !== "/") {
    throw new AppError(400, "Provide the base service URL only.", {
      renderUrl: "Do not include a path. The backend will check /health automatically.",
    });
  }

  const normalizedUrl = `${parsedUrl.origin}/`;
  const healthUrl = new URL("/health", normalizedUrl).toString();

  return {
    originalUrl: trimmedUrl,
    normalizedUrl,
    healthUrl,
    host,
  };
};

export const getHealthProbe = async (healthUrl, timeoutMs = 5000) => {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const parsedUrl = new URL(healthUrl);
    await assertHostResolvesToPublicAddress(parsedUrl.hostname);

    const response = await fetch(healthUrl, {
      method: "GET",
      redirect: "error",
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
        "User-Agent": "Render-Keepalive/1.0",
      },
    });

    const body = await response.text();
    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      throw new AppError(422, "Health endpoint returned a non-success status.", {
        healthUrl: `Health endpoint responded with HTTP ${response.status}.`,
      });
    }

    if (body.length > 2048) {
      throw new AppError(422, "Health endpoint response is too large.", {
        healthUrl: "Health response must stay lightweight and fast.",
      });
    }

    if (latencyMs > timeoutMs) {
      throw new AppError(422, "Health endpoint is too slow.", {
        healthUrl: `Health endpoint took ${latencyMs}ms, which is too slow for keepalive protection.`,
      });
    }

    return {
      statusCode: response.status,
      latencyMs,
      body,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AppError(422, "Health endpoint timed out.", {
        healthUrl: `Health endpoint did not respond within ${timeoutMs}ms.`,
      });
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(422, "Unable to verify the health endpoint.", {
      healthUrl: "The health endpoint could not be verified.",
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const pingRenderHealth = async (healthUrl) => {
  return getHealthProbe(healthUrl, 4000);
};
