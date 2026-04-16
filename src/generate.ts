import Anthropic from '@anthropic-ai/sdk';
import type { StoryPackage } from './types';

const SYSTEM_PROMPT = `You are an expert YouTube content creator specializing in toddler bedtime story videos (ages 2-4). You generate complete, professional video production packages used by real creators.

CRITICAL RULE: Respond with ONLY a valid JSON object. No markdown code blocks, no preamble, no explanation. Your entire response must start with { and end with }. Nothing before or after.`;

function buildPrompt(title: string, characters: string): string {
  return `Create a complete YouTube bedtime story video production package.

Title: "${title}"
Characters: ${characters}

Return ONLY this JSON structure. All arrays must have exactly 6 items:

{
  "narrationScript": [
    {
      "scene": 1,
      "title": "Descriptive scene title",
      "duration": "~45 seconds",
      "narration": "Warm, soothing narration for toddlers ages 2-4. Use simple vocabulary, gentle imagery, and a calming rhythm. 3-5 sentences. Paint a peaceful mental picture."
    },
    { "scene": 2, "title": "...", "duration": "~50 seconds", "narration": "Continue the story with gentle wonder and soft adventure..." },
    { "scene": 3, "title": "...", "duration": "~50 seconds", "narration": "..." },
    { "scene": 4, "title": "...", "duration": "~45 seconds", "narration": "Begin slowing the story down, softer tone..." },
    { "scene": 5, "title": "...", "duration": "~45 seconds", "narration": "Very gentle, sleepy tone. Characters begin to rest..." },
    { "scene": 6, "title": "Sweet Dreams", "duration": "~30 seconds", "narration": "Tender closing that invites the child to close their eyes and drift to sleep alongside the characters..." }
  ],
  "klingPrompts": [
    {
      "scene": 1,
      "prompt": "Kling AI video prompt: [visual style: soft watercolor animation, Studio Ghibli-inspired, gentle pastel palette, painterly strokes] [scene: describe exact environment, time of day, atmosphere] [characters: describe cute rounded toddler-friendly character designs and their expressions/poses] [lighting: warm golden hour or soft moonlight with gentle god rays] [movement: slow gentle camera pan left, soft parallax on background elements, characters breathing/subtle idle animation] [effects: floating magical sparkles, soft bokeh, dreamy atmosphere, gentle color grading] [mood: peaceful, cozy, magical]",
      "negativePrompt": "photorealistic, scary, horror, dark shadows, fast motion, jerky movement, text overlay, watermarks, violent, disturbing, ugly, deformed, 3D CGI"
    },
    { "scene": 2, "prompt": "...", "negativePrompt": "photorealistic, scary, dark, harsh lighting, fast movement, text, watermarks, violent" },
    { "scene": 3, "prompt": "...", "negativePrompt": "photorealistic, scary, dark, harsh lighting, fast movement, text, watermarks, violent" },
    { "scene": 4, "prompt": "...", "negativePrompt": "photorealistic, scary, dark, harsh lighting, fast movement, text, watermarks, violent" },
    { "scene": 5, "prompt": "...", "negativePrompt": "photorealistic, scary, dark, harsh lighting, fast movement, text, watermarks, violent" },
    { "scene": 6, "prompt": "Cozy moonlit bedroom scene. Soft watercolor animation style. Sleeping character curled under warm blanket, teddy bear nearby, crescent moon visible through window with stars twinkling gently. Candle or nightlight casting warm amber glow. Ultra peaceful and dreamy. Extremely slow gentle zoom out. Soft sparkles floating upward. Color palette: deep navy, warm amber, soft lavender.", "negativePrompt": "photorealistic, scary, dark, harsh lighting, fast movement, text, watermarks, violent" }
  ],
  "elevenLabsSettings": {
    "recommendedVoice": "Specific ElevenLabs voice name recommendation (e.g. a soft female narrator voice)",
    "voiceDescription": "Why this voice works perfectly for bedtime stories for toddlers — warmth, pacing, and emotional quality",
    "stability": 0.75,
    "similarityBoost": 0.80,
    "styleExaggeration": 0.12,
    "speakerBoost": true,
    "speed": 0.82,
    "notes": "Delivery guidance: overall pacing, emotional tone throughout, how to handle pauses between sentences, emphasis on key imagery words, energy level appropriate for bedtime (very calm, whisper-adjacent)"
  },
  "capCutTimeline": {
    "totalDuration": "~5 minutes",
    "fps": 24,
    "resolution": "1920x1080",
    "scenes": [
      {
        "scene": 1,
        "clipDuration": "45s",
        "startTime": "0:00",
        "endTime": "0:45",
        "textOverlay": {
          "text": "Short subtitle or title card text",
          "position": "bottom-center",
          "fontSize": 52,
          "fontColor": "#FFFFFF",
          "animation": "fade-in"
        },
        "transition": "cross-dissolve 1.5s",
        "audioNote": "Fade in background music from 0% to 18% over first 5 seconds. Voice narration at 100%."
      },
      {
        "scene": 2,
        "clipDuration": "50s",
        "startTime": "0:46",
        "endTime": "1:36",
        "textOverlay": { "text": "...", "position": "bottom-center", "fontSize": 52, "fontColor": "#FFFFFF", "animation": "fade-in" },
        "transition": "cross-dissolve 1.5s",
        "audioNote": "Music steady at 18%."
      },
      {
        "scene": 3,
        "clipDuration": "50s",
        "startTime": "1:37",
        "endTime": "2:27",
        "textOverlay": { "text": "...", "position": "bottom-center", "fontSize": 52, "fontColor": "#FFFFFF", "animation": "fade-in" },
        "transition": "cross-dissolve 1.5s",
        "audioNote": "Music steady at 18%."
      },
      {
        "scene": 4,
        "clipDuration": "45s",
        "startTime": "2:28",
        "endTime": "3:13",
        "textOverlay": { "text": "...", "position": "bottom-center", "fontSize": 52, "fontColor": "#FFFFFF", "animation": "fade-in" },
        "transition": "cross-dissolve 2s",
        "audioNote": "Slightly lower music to 15% to signal winding down."
      },
      {
        "scene": 5,
        "clipDuration": "45s",
        "startTime": "3:14",
        "endTime": "3:59",
        "textOverlay": { "text": "...", "position": "bottom-center", "fontSize": 52, "fontColor": "#FFFFFF", "animation": "fade-in" },
        "transition": "cross-dissolve 2s",
        "audioNote": "Slowly fade music to 10%. Narration becomes gentler."
      },
      {
        "scene": 6,
        "clipDuration": "30s",
        "startTime": "4:00",
        "endTime": "4:30",
        "textOverlay": { "text": "Sweet Dreams ✨", "position": "center", "fontSize": 64, "fontColor": "#FFD166", "animation": "fade-in-slow" },
        "transition": "fade-to-black 4s",
        "audioNote": "Gently fade both music and voice to silence over 15 seconds. End in peaceful quiet."
      }
    ],
    "backgroundMusic": "Specific music recommendation: gentle piano lullaby in C major, slow tempo ~55-60 BPM, soft strings layered underneath, optional subtle nature sounds (crickets, light rain), no percussion, royalty-free suggested sources (e.g. epidemicsound.com search terms)",
    "musicVolume": "18%",
    "voiceVolume": "100%"
  },
  "youtubePackage": {
    "title": "Full SEO-optimized YouTube title — include story name + keywords (bedtime story, toddlers, sleep) — keep under 60 characters",
    "description": "Full 400-500 word YouTube description: 1) Opening hook paragraph, 2) Story summary in 2 paragraphs, 3) Why parents love this video section, 4) Timestamps (0:00 Introduction, 0:15 Scene 1 title, etc.), 5) Subscribe + notification bell CTA, 6) Parent note about healthy screen time, 7) 8-10 relevant hashtags (#bedtimestory #toddler #kidssleep etc) at very end",
    "tags": ["bedtime story", "toddler bedtime story", "kids bedtime", "sleep story for kids", "bedtime stories for toddlers", "children bedtime story", "animated bedtime story", "toddler sleep", "kids sleep", "baby bedtime story", "sleepy story for kids", "calming story", "2 year old story", "3 year old bedtime", "bedtime routine"],
    "category": "Education",
    "madeForKids": true,
    "thumbnailText": "Punchy 4-6 word thumbnail headline that grabs attention"
  },
  "canvaThumbnailBrief": {
    "dimensions": "1280x720",
    "backgroundColor": "Specific color gradient with hex codes (e.g. deep midnight blue #0D1B40 to soft purple #2D1B69, top to bottom)",
    "backgroundScene": "Detailed description of background illustration — what elements, atmosphere, depth layers, art style",
    "mainCharacterPlacement": "Exact positioning: size (e.g. 65% of thumbnail height), horizontal position (center/left/right), expression, pose, any glow or highlight effect around character",
    "titleText": {
      "text": "Thumbnail display title (shortened if needed for visual impact)",
      "font": "Specific Canva font name (e.g. Baloo 2, Nunito Black, Fredoka One, Paytone One)",
      "size": "Large dominant size (120-140px equivalent)",
      "color": "#FFFFFF",
      "effect": "Drop shadow: color #000, opacity 60%, blur 8px — or outer glow in warm gold #FFD166"
    },
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "stickers": "Specific Canva sticker/element suggestions: golden stars, crescent moon, sparkles, sleeping Zs, soft clouds, rainbow, etc.",
    "mood": "One descriptive phrase (e.g. Magical and cozy / Dreamy and soft / Whimsical and warm)",
    "designTips": "4-5 specific actionable Canva tips for this exact thumbnail: background creation method, character placement tricks, text hierarchy, which Canva effects/filters to apply, final polish steps"
  }
}`;
}

export async function generateStoryPackage(
  apiKey: string,
  title: string,
  characters: string,
  onProgress?: (message: string) => void
): Promise<StoryPackage> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const progressMessages = [
    '🌙 Claude is crafting your story world...',
    '📖 Writing narration scenes...',
    '🎬 Designing Kling AI video prompts...',
    '🎤 Configuring ElevenLabs voice settings...',
    '✂️ Building CapCut editing timeline...',
    '📺 Crafting YouTube SEO package...',
    '🎨 Designing Canva thumbnail brief...',
    '⭐ Polishing final details...',
  ];

  let progressIndex = 0;
  onProgress?.(progressMessages[0]);

  const progressInterval = setInterval(() => {
    progressIndex = (progressIndex + 1) % progressMessages.length;
    onProgress?.(progressMessages[progressIndex]);
  }, 2800);

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 16000,
      // @ts-ignore -- thinking is valid at runtime but untyped in SDK 0.36.x
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPrompt(title, characters) }],
    });

    const message = await stream.finalMessage();
    clearInterval(progressInterval);
    onProgress?.('📦 Processing your complete package...');

    const textBlock = message.content.find((b: { type: string }) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response received. Please try again.');
    }

    let jsonText = textBlock.text.trim();

    // Strip markdown code blocks if Claude adds them
    const codeMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) {
      jsonText = codeMatch[1].trim();
    }

    // Find JSON boundaries in case there's surrounding text
    const start = jsonText.indexOf('{');
    const end = jsonText.lastIndexOf('}');
    if (start !== -1 && end > start) {
      jsonText = jsonText.slice(start, end + 1);
    }

    if (!jsonText.startsWith('{')) {
      throw new Error('Response was not in the expected JSON format. Please try again.');
    }

    return JSON.parse(jsonText) as StoryPackage;
  } catch (err) {
    clearInterval(progressInterval);
    if (err instanceof SyntaxError) {
      throw new Error('Failed to parse the AI response. Please try again.');
    }
    if (err instanceof Anthropic.AuthenticationError) {
      throw new Error('Invalid API key. Please check your Anthropic API key and try again.');
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    }
    throw err;
  }
}
