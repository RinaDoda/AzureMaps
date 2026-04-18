import Anthropic from '@anthropic-ai/sdk';
import type { StoryData } from './types';

const SYSTEM_PROMPT = `You are a toddler bedtime story writer and YouTube content expert. Generate exactly what is asked.
CRITICAL: Respond with ONLY valid JSON. Start with { end with }. No markdown, no explanation.`;

function buildPrompt(title: string, characters: string): string {
  return `Create a 5-minute bedtime story video package for toddlers ages 1-3.

Title: "${title}"
Characters: ${characters}

IMPORTANT: Every klingPrompt must be UNDER 280 characters (count carefully). Keep them concise but vivid.

Return ONLY this exact JSON structure (6 scenes, soft calming tone, simple vocabulary):

{
  "scenes": [
    {
      "sceneNumber": 1,
      "narration": "Warm soothing narration, 60-70 words, gentle imagery. Simple vocabulary for ages 1-3.",
      "klingPrompt": "Watercolor animation, pastel colors, toddler-friendly. [Scene: describe setting in ~10 words]. [Characters: cute rounded designs, calm expressions]. Slow gentle camera pan, soft bokeh, warm light. Under 280 chars total.",
      "estimatedSeconds": 50
    },
    {
      "sceneNumber": 2,
      "narration": "Continue with gentle wonder, 60-70 words...",
      "klingPrompt": "Watercolor animation, pastel colors. [Scene: ...]. [Characters: ...]. Gentle drift, soft sparkles. Under 280 chars.",
      "estimatedSeconds": 50
    },
    {
      "sceneNumber": 3,
      "narration": "60-70 words, growing sleepy tone...",
      "klingPrompt": "Watercolor animation, soft pastels. [Scene: ...]. [Characters: ...]. Very gentle drift, warm glow. Under 280 chars.",
      "estimatedSeconds": 50
    },
    {
      "sceneNumber": 4,
      "narration": "50-60 words, slower pacing, softer tone...",
      "klingPrompt": "Watercolor animation, twilight pastels. [Scene: describe winding-down setting]. [Characters: sleepy expressions]. Soft moonlight, slow zoom. Under 280 chars.",
      "estimatedSeconds": 45
    },
    {
      "sceneNumber": 5,
      "narration": "40-50 words, very sleepy, whispery tone...",
      "klingPrompt": "Watercolor animation, deep navy and amber. [Scene: cozy nighttime, characters nearly asleep]. Soft candlelight, slow drift. Under 280 chars.",
      "estimatedSeconds": 40
    },
    {
      "sceneNumber": 6,
      "narration": "30-40 words, tender closing, invite child to sleep alongside characters...",
      "klingPrompt": "Watercolor animation, deep navy and gold. Moonlit bedroom, character asleep under blanket, stars twinkling, candle glow. Extremely slow zoom out, ultra peaceful. Under 280 chars.",
      "estimatedSeconds": 30
    }
  ],
  "fullNarration": "Complete narration for all 6 scenes concatenated in order with a blank line between each scene, ready for text-to-speech.",
  "youtubeTitle": "Story title optimized for YouTube search, under 70 chars, include 'Bedtime Story' and age range",
  "youtubeDescription": "Full YouTube description 200-300 words. Include story summary, age recommendation, chapters with timestamps (assume 50s per scene), call to action, keywords for SEO.",
  "youtubeTags": ["bedtime story", "toddler", "kids", "sleep", "calming", "animated", "lullaby", "1 year old", "2 year old", "3 year old"],
  "bestUploadTime": "Best day and time to upload this type of video for maximum reach, with brief reasoning"
}`;
}

const PROGRESS_MESSAGES = [
  '✍️ Writing your bedtime story...',
  '🌙 Crafting Scene 1...',
  '⭐ Building Scene 2...',
  '🌟 Weaving Scene 3...',
  '💫 Composing Scene 4...',
  '😴 Writing the sleepy parts...',
  '🎬 Creating Kling prompts...',
  '📺 Preparing YouTube copy...',
];

export async function generateStoryData(
  apiKey: string,
  title: string,
  characters: string,
  onProgress?: (msg: string) => void,
): Promise<StoryData> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  let msgIdx = 0;
  onProgress?.(PROGRESS_MESSAGES[0]);
  const interval = setInterval(() => {
    msgIdx = (msgIdx + 1) % PROGRESS_MESSAGES.length;
    onProgress?.(PROGRESS_MESSAGES[msgIdx]);
  }, 2800);

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      // @ts-ignore -- thinking valid at runtime, untyped in SDK 0.36.x
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPrompt(title, characters) }],
    });

    const message = await stream.finalMessage();
    clearInterval(interval);
    onProgress?.('📦 Processing your story...');

    const textBlock = message.content.find((b: { type: string }) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response received. Please try again.');
    }

    let jsonText = (textBlock as { type: 'text'; text: string }).text.trim();
    const codeMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) jsonText = codeMatch[1].trim();

    const start = jsonText.indexOf('{');
    const end = jsonText.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Invalid JSON response from Claude. Please try again.');
    jsonText = jsonText.slice(start, end + 1);

    return JSON.parse(jsonText) as StoryData;
  } catch (e) {
    clearInterval(interval);
    if (e instanceof Anthropic.AuthenticationError) {
      throw new Error('Invalid API key. Please check your Anthropic API key.');
    }
    if (e instanceof Anthropic.RateLimitError) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    }
    if (e instanceof SyntaxError) {
      throw new Error('Failed to parse the generated story. Please try again.');
    }
    throw e;
  }
}
