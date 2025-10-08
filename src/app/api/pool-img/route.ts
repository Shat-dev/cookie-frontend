// [POOL-IMG] IPFS image proxy with parallel gateway racing, timeouts, and strong caching
import { NextRequest, NextResponse } from "next/server";

const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs",
  "https://ipfs.io/ipfs",
  "https://cyan-cautious-hare-412.mypinata.cloud/ipfs",
  "https://nftstorage.link/ipfs",
  "https://dweb.link/ipfs",
];

const MAX_ATTEMPTS = 2;
const GATEWAY_TIMEOUT = 2500; // 2.5 seconds per gateway attempt
const DEBUG_POOL_IMG = process.env.DEBUG_POOL_IMG === "true";

// Log function that respects DEBUG flag
const debugLog = (message: string, data?: unknown) => {
  if (DEBUG_POOL_IMG) {
    console.log(`[POOL-IMG] ${message}`, data || "");
  }
};

// Race all gateways with timeout for a single attempt
async function raceGateways(
  cid: string,
  file: string,
  attemptNumber: number
): Promise<Response> {
  const promises = GATEWAYS.map(async (gateway, index) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GATEWAY_TIMEOUT);

    const url = `${gateway}/${cid}/${file}`;
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "force-cache",
        next: { revalidate: 31536000 }, // 1 year
      });

      const duration = Date.now() - startTime;
      debugLog(`Gateway ${index} attempt ${attemptNumber}`, {
        gateway,
        status: response.status,
        duration: `${duration}ms`,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      debugLog(`Gateway ${index} attempt ${attemptNumber} failed`, {
        gateway,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      });

      clearTimeout(timeoutId);
      throw error;
    }
  });

  // Use Promise.any to return the first successful response
  try {
    return await Promise.any(promises);
  } catch {
    // All gateways failed for this attempt
    throw new Error(`All gateways failed for attempt ${attemptNumber}`);
  }
}

// Add jitter to backoff delay
function getBackoffDelay(attemptNumber: number): number {
  const baseDelay = 300 * Math.pow(2, attemptNumber);
  const jitter = Math.random() * 0.3 * baseDelay; // 30% jitter
  return baseDelay + jitter;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cid = searchParams.get("cid");
  const file = searchParams.get("file");

  // Sanitize inputs - allow 0-9a-zA-Z._-/
  if (
    !cid ||
    !file ||
    !/^[0-9a-zA-Z._/-]+$/.test(file) ||
    !/^[0-9a-zA-Z._/-]+$/.test(cid)
  ) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  debugLog(`Starting fetch for ${cid}/${file}`);

  let lastError: Error | null = null;
  let hasNon404Error = false;

  // Try up to MAX_ATTEMPTS with exponential backoff
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await raceGateways(cid, file, attempt);

      if (response.ok) {
        // Success! Set up strong caching headers
        const contentType = response.headers.get("content-type") || "image/png";
        const arrayBuffer = await response.arrayBuffer();

        // Try to get ETag from upstream, or create a weak one
        let etag = response.headers.get("etag");
        if (!etag) {
          const lastModified = response.headers.get("last-modified");
          const contentLength = response.headers.get("content-length");
          if (lastModified && contentLength) {
            etag = `W/"${Buffer.from(lastModified + contentLength).toString(
              "base64"
            )}"`;
          }
        }

        const headers: Record<string, string> = {
          "Cache-Control":
            "public, max-age=31536000, immutable, s-maxage=31536000, stale-while-revalidate=86400",
          "Content-Type": contentType,
        };

        if (etag) {
          headers["ETag"] = etag;
        }

        debugLog(`Success on attempt ${attempt}`, {
          contentType,
          size: `${arrayBuffer.byteLength} bytes`,
          etag: etag || "none",
        });

        return new NextResponse(arrayBuffer, {
          status: 200,
          headers,
        });
      }

      if (response.status === 404) {
        debugLog(`404 response on attempt ${attempt}`);
        lastError = new Error(`404 Not Found`);
        // Don't set hasNon404Error for 404s
      } else {
        // Non-404 error (5xx, etc.)
        hasNon404Error = true;
        lastError = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
        debugLog(`Non-404 error on attempt ${attempt}`, {
          status: response.status,
          statusText: response.statusText,
        });
      }
    } catch (error) {
      hasNon404Error = true; // Network errors, timeouts, etc.
      lastError = error instanceof Error ? error : new Error("Unknown error");
      debugLog(`Attempt ${attempt} failed with error`, {
        error: lastError.message,
      });
    }

    // Wait before next attempt (except on last attempt)
    if (attempt < MAX_ATTEMPTS) {
      const delay = getBackoffDelay(attempt);
      debugLog(`Waiting ${delay.toFixed(0)}ms before attempt ${attempt + 1}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  if (!hasNon404Error && lastError?.message.includes("404")) {
    // Only 404s encountered across all gateways and attempts
    debugLog(`Returning 404 after all attempts`);
    return new NextResponse("Not Found", { status: 404 });
  } else {
    // Had timeouts, 5xx errors, or network issues
    debugLog(`Returning 503 after all attempts`, {
      lastError: lastError?.message,
    });
    return new NextResponse("Service Unavailable", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
