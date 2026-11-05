/** True when running inside the Despia native app wrapper (its WebView adds "despia" to the user agent). */
export function isNativeShell(): boolean {
  if (typeof navigator === "undefined") return false;
  return /despia/i.test(navigator.userAgent);
}
