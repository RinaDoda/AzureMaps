export interface NarrationScene {
  scene: number;
  title: string;
  duration: string;
  narration: string;
}

export interface KlingPrompt {
  scene: number;
  prompt: string;
  negativePrompt: string;
}

export interface ElevenLabsSettings {
  recommendedVoice: string;
  voiceDescription: string;
  stability: number;
  similarityBoost: number;
  styleExaggeration: number;
  speakerBoost: boolean;
  speed: number;
  notes: string;
}

export interface CapCutScene {
  scene: number;
  clipDuration: string;
  startTime: string;
  endTime: string;
  textOverlay: {
    text: string;
    position: string;
    fontSize: number;
    fontColor: string;
    animation: string;
  };
  transition: string;
  audioNote: string;
}

export interface CapCutTimeline {
  totalDuration: string;
  fps: number;
  resolution: string;
  scenes: CapCutScene[];
  backgroundMusic: string;
  musicVolume: string;
  voiceVolume: string;
}

export interface YoutubePackage {
  title: string;
  description: string;
  tags: string[];
  category: string;
  madeForKids: boolean;
  thumbnailText: string;
}

export interface CanvaThumbnailBrief {
  dimensions: string;
  backgroundColor: string;
  backgroundScene: string;
  mainCharacterPlacement: string;
  titleText: {
    text: string;
    font: string;
    size: string;
    color: string;
    effect: string;
  };
  colorPalette: string[];
  stickers: string;
  mood: string;
  designTips: string;
}

export interface StoryPackage {
  narrationScript: NarrationScene[];
  klingPrompts: KlingPrompt[];
  elevenLabsSettings: ElevenLabsSettings;
  capCutTimeline: CapCutTimeline;
  youtubePackage: YoutubePackage;
  canvaThumbnailBrief: CanvaThumbnailBrief;
}
