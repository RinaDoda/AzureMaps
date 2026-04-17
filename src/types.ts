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

export type AppStage =
  | 'form'
  | 'generating-script'
  | 'generating-voiceover'
  | 'ready-for-clips'
  | 'assembling'
  | 'complete';

export interface AssemblyResult {
  videoURL: string;
  thumbnailURL: string;
}
