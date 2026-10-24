function hostnameAllowed(hostname: string): boolean {
  return (
    hostname.endsWith('pexels.com') ||
    hostname.endsWith('cdninstagram.com') ||
    hostname.endsWith('fbcdn.net') ||
    hostname === 'instagram.com' ||
    hostname.endsWith('.instagram.com')
  );
}

export function isAllowedMediaVideoUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' && hostnameAllowed(parsed.hostname);
  } catch {
    return false;
  }
}

/** Route remote MP4s through our proxy for CORS + Range requests. */
export function mediaVideoProxySrc(directUrl: string): string {
  if (directUrl.startsWith('/') || !/^https?:\/\//i.test(directUrl)) {
    return directUrl;
  }
  return `/api/media/video-proxy?url=${encodeURIComponent(directUrl)}`;
}

export const MEDIA_PROXY_UPSTREAM_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Referer: 'https://www.instagram.com/',
  Accept: '*/*',
};
