import { createHmac } from 'crypto';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function getSecret(): string {
  const s = process.env.TIKTOK_SERVE_SECRET ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!s) throw new Error('TIKTOK_SERVE_SECRET or BLOB_READ_WRITE_TOKEN required');
  return s;
}

export function createServeToken(blobUrl: string): string {
  const secret = getSecret();
  const exp = String(Date.now() + TOKEN_TTL_MS);
  const payload =
    Buffer.from(exp, 'utf8').toString('base64url') +
    '.' +
    Buffer.from(blobUrl, 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return payload + '.' + sig;
}

export function verifyServeToken(token: string): { blobUrl: string } {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [expB64, urlB64, sig] = parts;
  const payload = expB64 + '.' + urlB64;
  const secret = getSecret();
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (expected !== sig) throw new Error('Invalid token');
  const exp = parseInt(Buffer.from(expB64, 'base64url').toString('utf8'), 10);
  if (Date.now() > exp) throw new Error('Token expired');
  const blobUrl = Buffer.from(urlB64, 'base64url').toString('utf8');
  if (!blobUrl.startsWith('http')) throw new Error('Invalid token');
  return { blobUrl };
}
