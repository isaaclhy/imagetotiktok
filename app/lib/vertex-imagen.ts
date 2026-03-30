import { GoogleAuth } from 'google-auth-library';

/** Optional: full service account JSON string (e.g. Vercel secret) when file path is unavailable */
function googleAuthOptions(): ConstructorParameters<typeof GoogleAuth>[0] {
  const scopes = ['https://www.googleapis.com/auth/cloud-platform'];
  const inline = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.trim();
  if (inline) {
    try {
      return { scopes, credentials: JSON.parse(inline) as object };
    } catch {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON');
    }
  }
  return { scopes };
}

export type VertexImagenOptions = {
  prompt: string;
  projectId: string;
  location: string;
  model: string;
  /** Imagen aspect ratio; default 9:16 for vertical covers */
  aspectRatio?: string;
  sampleImageSize?: '1K' | '2K';
};

/**
 * Text-to-image via Vertex AI Imagen predict API.
 * Uses Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS or GCP metadata).
 */
export async function generateVertexImagenImage(
  options: VertexImagenOptions
): Promise<{ mimeType: string; base64: string }> {
  const {
    prompt,
    projectId,
    location,
    model,
    aspectRatio = '9:16',
    sampleImageSize = '1K',
  } = options;

  const auth = new GoogleAuth(googleAuthOptions());
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const token = accessToken.token;
  if (!token) {
    throw new Error('Could not obtain Google Cloud access token (check ADC / service account)');
  }

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      sampleImageSize,
      outputOptions: { mimeType: 'image/png' },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Vertex Imagen HTTP ${res.status}: ${raw.slice(0, 500)}`);
  }

  let data: { predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }> };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error('Vertex Imagen returned invalid JSON');
  }

  const pred = data.predictions?.[0];
  const b64 = pred?.bytesBase64Encoded;
  if (!b64) {
    throw new Error(
      'Vertex Imagen returned no image (empty predictions or blocked by safety filters)'
    );
  }

  return {
    mimeType: pred.mimeType || 'image/png',
    base64: b64,
  };
}

export function getVertexImagenConfigFromEnv(): {
  projectId: string;
  location: string;
  model: string;
} | null {
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT?.trim() || process.env.GCP_PROJECT_ID?.trim() || '';
  if (!projectId) return null;

  const location = (process.env.VERTEX_LOCATION || 'us-central1').trim();
  const model = (process.env.VERTEX_IMAGEN_MODEL || 'imagen-3.0-generate-002').trim();

  return { projectId, location, model };
}
