/** Best-effort client device fingerprint labels for the login history list. */
export function describeDevice() {
  if (typeof navigator === "undefined") {
    return { device: "Unknown device", browser: "Unknown browser", platform: "Unknown" };
  }
  const ua = navigator.userAgent;

  const browser = /Edg\//.test(ua)
    ? "Microsoft Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : /Firefox\//.test(ua)
            ? "Firefox"
            : "Unknown browser";

  const platform = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown";

  const device = /iPad|Tablet/.test(ua)
    ? "Tablet"
    : /Mobi|Android|iPhone/.test(ua)
      ? "Mobile"
      : "Desktop";

  return { device: `${device} · ${platform}`, browser, platform };
}
