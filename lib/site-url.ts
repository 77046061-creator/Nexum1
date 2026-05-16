export function getSiteUrl(request?: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl !== "http://localhost:3000") return envUrl;

  if (request) {
    const url = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
    const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
    if (host !== "localhost:3000") {
      return `${proto}://${host}`;
    }
  }

  return "http://localhost:3000";
}
