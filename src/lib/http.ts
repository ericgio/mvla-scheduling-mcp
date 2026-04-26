const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchBytes(
  url: string,
  init: RequestInit = {},
): Promise<{ bytes: Buffer; contentType: string; contentDisposition: string }> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'User-Agent': USER_AGENT,
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  const bytes = Buffer.from(await res.arrayBuffer());
  return {
    bytes,
    contentType: res.headers.get('content-type') ?? '',
    contentDisposition: res.headers.get('content-disposition') ?? '',
  };
}
