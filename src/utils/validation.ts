/**
 * Client-side URL validation and SSRF sanitization utilities.
 */

export interface ValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  errorMessage?: string;
}

const PRIVATE_IP_REGEX = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/;

export function validateAndNormalizeUrl(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: "",
      errorMessage: "Please enter a URL to analyze.",
    };
  }

  // Prepend https:// if no protocol given
  const fullUrl = trimmed.includes("://") ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(fullUrl);

    // Protocol restriction
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        isValid: false,
        normalizedUrl: fullUrl,
        errorMessage: "Only HTTP and HTTPS URLs can be scanned.",
      };
    }

    const host = parsed.hostname.toLowerCase();

    // `URL` accepts whitespace in hostnames by percent-encoding it, even
    // though those values cannot resolve as ordinary web destinations.
    if (
      !host ||
      host.includes("%") ||
      /\s/.test(host) ||
      !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?))*\.?$|^\[[0-9a-f:]+\]$/i.test(host)
    ) {
      return {
        isValid: false,
        normalizedUrl: fullUrl,
        errorMessage: "Invalid web address. Check the destination and try again.",
      };
    }

    // SSRF / Localhost prevention
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]" ||
      PRIVATE_IP_REGEX.test(host)
    ) {
      return {
        isValid: false,
        normalizedUrl: fullUrl,
        errorMessage: "Scanning localhost and private network addresses is blocked for security.",
      };
    }

    return {
      isValid: true,
      normalizedUrl: fullUrl,
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: fullUrl,
      errorMessage: "Invalid URL format. Please provide a valid web address.",
    };
  }
}

/**
 * Escapes user-controlled strings for safe display (anti-XSS).
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
