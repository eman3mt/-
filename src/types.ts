export type SaudiRegionCode = 'najdi' | 'hijazi' | 'eastern' | 'southern' | 'northern' | 'fusha_saudi';

export type AmbientSoundId =
  | 'none'
  | 'folk_cafe'
  | 'heritage_souq'
  | 'desert_calm'
  | 'saudi_majlis'
  | 'sea_breeze'
  | 'asir_rain'
  | 'diriyah_evening';

export interface AmbientSoundscape {
  id: AmbientSoundId;
  name: string;
  englishName: string;
  category: 'urban' | 'nature' | 'heritage' | 'custom';
  categoryLabel: string;
  icon: string;
  description: string;
  soundElements: string[];
  badge: string;
  accentColor: string;
  bgGradient: string;
}

export interface SaudiRegion {
  id: SaudiRegionCode;
  name: string;
  subTitle: string;
  description: string;
  provinces: string[];
  samplePhrase: string;
  iconicWords: string[];
  accentColor: string;
  badge: string;
}

export type Gender = 'female' | 'male';

export interface VoicePersona {
  id: string;
  name: string;
  gender: Gender;
  geminiVoice: 'Kore' | 'Zephyr' | 'Aoede' | 'Fenrir' | 'Charon' | 'Puck';
  personality: string;
  bestSuitedFor: string;
  sampleAudioText: string;
  avatarSeed: string;
  tag: string;
}

export interface VoiceTone {
  id: string;
  name: string;
  english: string;
  description: string;
  icon: string;
  category: 'formal' | 'casual' | 'creative' | 'marketing';
}

export interface EmotionalExpression {
  id: string;
  name: string;
  emoji: string;
  description: string;
  promptCue: string;
}

export interface PresetTemplate {
  id: string;
  category: 'hospitality' | 'marketing' | 'tourism' | 'customer_care' | 'story' | 'celebration' | 'casual';
  categoryLabel: string;
  title: string;
  region: SaudiRegionCode;
  recommendedVoice: string;
  recommendedTone: string;
  recommendedEmotion: string;
  recommendedAmbient?: AmbientSoundId;
  text: string;
}

export interface GeneratedAudioItem {
  id: string;
  timestamp: number;
  text: string;
  audioBase64: string;
  wavBlobUrl?: string;
  durationSeconds?: number;
  regionCode: SaudiRegionCode;
  regionName: string;
  voiceName: string;
  gender: Gender;
  tone: string;
  emotion: string;
  speed: number;
  pitch: string;
  ambientSound?: AmbientSoundId;
  ambientSoundName?: string;
  ambientVolume?: number;
  isFavorite?: boolean;
}

export interface TTSRequestOptions {
  text: string;
  regionCode: SaudiRegionCode;
  regionName: string;
  gender: Gender;
  voiceName: string;
  tone: string;
  emotion: string;
  speed: number;
  pitch: string;
  ambientSound?: AmbientSoundId;
  includePhonetics?: boolean;
}

