const BASE = 'https://api.klingai.com';

async function makeJWT(accessKey: string, secretKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ iss: accessKey, exp: now + 1800, nbf: now - 5 });
  const unsigned = `${header}.${payload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return `${unsigned}.${sig}`;
}

async function klingFetch(
  method: string,
  path: string,
  accessKey: string,
  secretKey: string,
  body?: unknown,
): Promise<Record<string, unknown>> {
  const jwt = await makeJWT(accessKey, secretKey);
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Kling API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Record<string, unknown>>;
}

export async function submitKlingVideo(
  accessKey: string,
  secretKey: string,
  prompt: string,
): Promise<string> {
  const data = await klingFetch('POST', '/v1/videos/text2video', accessKey, secretKey, {
    model_name: 'kling-v1-6',
    prompt,
    negative_prompt:
      'photorealistic, scary, horror, dark shadows, fast motion, text overlay, watermarks, violent, disturbing, 3D CGI',
    cfg_scale: 0.5,
    mode: 'std',
    duration: '5',
    aspect_ratio: '16:9',
  });
  const inner = data.data as { task_id: string };
  return inner.task_id;
}

export async function pollKlingVideo(
  accessKey: string,
  secretKey: string,
  taskId: string,
  onStatus?: (s: string) => void,
): Promise<string> {
  for (let i = 0; i < 72; i++) {
    await new Promise((r) => setTimeout(r, 10_000));
    try {
      const data = await klingFetch(
        'GET',
        `/v1/videos/text2video/${taskId}`,
        accessKey,
        secretKey,
      );
      const inner = data.data as {
        task_status: string;
        task_result?: { videos: Array<{ url: string }> };
      };
      onStatus?.(inner.task_status);
      if (inner.task_status === 'succeed' && inner.task_result?.videos?.[0]?.url) {
        return inner.task_result.videos[0].url;
      }
      if (inner.task_status === 'failed') throw new Error(`Kling task ${taskId} failed`);
    } catch (e) {
      if ((e as Error).message.includes('failed')) throw e;
    }
  }
  throw new Error('Kling video timed out after 12 minutes');
}

export async function fetchVideoBlob(url: string): Promise<Blob> {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`Could not download Kling video (${res.status})`);
  return res.blob();
}
