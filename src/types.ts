export interface Scene {
  sceneNumber: number;
  narration: string;
  klingPrompt: string;
  estimatedSeconds: number;
}

export interface StoryData {
  scenes: Scene[];
  fullNarration: string;
  youtubeTitle: string;
  youtubeDescription: string;
  youtubeTags: string[];
  bestUploadTime: string;
}

export type ClipStatus = 'pending' | 'submitting' | 'generating' | 'downloading' | 'done' | 'error';

export type AppStage =
  | 'form'
  | 'generating-script'
  | 'generating-assets'
  | 'assembling'
  | 'complete';
