/**
 * Safely construct API URLs by ensuring no double slashes
 */
export function getApiUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  // Remove trailing slash if present
  return baseUrl.replace(/\/$/, "");
}

/**
 * Construct full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl();
  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
