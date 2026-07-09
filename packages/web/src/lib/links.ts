/**
 * External links surfaced in onboarding. "Get the extension" points at the
 * published store listing for the visitor's browser — Firefox users get the
 * AMO page, everyone else the Chrome Web Store.
 */

export const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/mutsu/pniomgcpoioiednjagpdmchjmdfileol";
export const FIREFOX_EXTENSION_URL = "https://addons.mozilla.org/en-US/firefox/addon/mutsu/";

/** The right store listing for the current browser. */
export const EXTENSION_URL = /firefox/i.test(
  typeof navigator === "undefined" ? "" : navigator.userAgent,
)
  ? FIREFOX_EXTENSION_URL
  : CHROME_EXTENSION_URL;
