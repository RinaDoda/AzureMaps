const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella

export async function generateVoiceover(
  apiKey: string,
  text: string,
  onProgress?: (msg: string) => void,
): Promise<Blob> {
  onProgress?.('🎙️ Connecting to ElevenLabs...');

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.8,
          style: 0.12,
          use_speaker_boost: true,
          speed: 0.82,
        },
      }),
    },
  );

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid ElevenLabs API key.');
    if (response.status === 422) throw new Error('ElevenLabs rejected the request. Check your API key and quota.');
    throw new Error(`ElevenLabs error ${response.status}: ${await response.text()}`);
  }

  onProgress?.('🔊 Voiceover generated!');
  return response.blob();
}
