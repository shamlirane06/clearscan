/**
 * Client-side URL validation and SSRF sanitization utilities.
 */

export interface ValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  errorMessage?: string;
}

function isBlockedHost(host: string): boolean {
  const bareHost = host.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (["localhost", "metadata.google.internal", "home.arpa"].includes(bareHost)
    || bareHost.endsWith(".localhost") || bareHost.endsWith(".local") || bareHost.endsWith(".internal")) return true;
  if (bareHost.includes(":")) return bareHost === "::" || bareHost === "::1" || bareHost.startsWith("::ffff:")
    || /^f[cd]/.test(bareHost) || /^fe[89ab]/.test(bareHost) || bareHost.startsWith("ff")
    || bareHost.startsWith("2001:db8:") || bareHost.startsWith("2001:10:") || bareHost.startsWith("2002:")
    || bareHost.startsWith("64:ff9b:") || bareHost.startsWith("100:");
  if (/^(?:0x[\da-f]+|\d+)(?:\.(?:0x[\da-f]+|\d+))*$/i.test(bareHost) && !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(bareHost)) return true;
  const parts = bareHost.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part) || Number(part) > 255)) return false;
  if (parts.some((part) => part.length > 1 && part.startsWith("0"))) return true;
  const [a,b,c] = parts.map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168 || b === 88 && c === 99))
    || (a === 198 && (b === 18 || b === 19 || b === 51 && c === 100)) || (a === 203 && b === 0 && c === 113);
}

export function validateAndNormalizeUrl(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: "",
      errorMessage: "Please enter a URL to analyze.",
    };
  }
  if (trimmed.length > 2048) return { isValid: false, normalizedUrl: "", errorMessage: "URL must not exceed 2048 characters." };

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

    if (parsed.username || parsed.password || parsed.port === "0") {
      return { isValid: false, normalizedUrl: fullUrl, errorMessage: "URLs with embedded credentials or invalid ports cannot be scanned." };
    }

    // SSRF / Localhost prevention
    if (isBlockedHost(host)) {
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
