export function optimizedImageUrl(
  url: string,
  width: number,
  options?: { height?: number; fit?: "max" }
) {
  if (!url) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const isImageKit = host === "ik.imagekit.io" || host.endsWith(".imagekit.io");

    if (!isImageKit || parsed.searchParams.has("tr")) {
      return url;
    }

    const height = options?.height ? `,h-${options.height}` : "";
    const fit = options?.fit === "max" ? ",c-at_max" : "";
    parsed.searchParams.set("tr", `w-${width}${height}${fit},q-70,f-auto`);
    return parsed.toString();
  } catch {
    return url;
  }
}
