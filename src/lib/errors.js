const KNOWN_CODES = [
  "missingKey",
  "invalidKey",
  "notFound",
  "rateLimit",
  "network",
  "server",
  "geoDenied",
  "geoUnavailable",
];

export function describeError(error, t) {
  const code = KNOWN_CODES.includes(error?.code) ? error.code : "unknown";
  return { code, title: t(`errors.${code}.title`), hint: t(`errors.${code}.hint`) };
}
