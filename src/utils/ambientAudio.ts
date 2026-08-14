import { AmbientSoundId } from '../types';
import { base64ToUint8Array } from './audioUtils';

/**
 * Procedural Web Audio API soundscape generator & mixer.
 * Synthesizes realistic Saudi acoustic environments in real-time
 * without relying on external heavy audio assets.
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentAmbient: AmbientSoundId = 'none';
  private isRunning: boolean = false;
  private activeNodes: Array<{ stop?: () => void; disconnect: () => void }> = [];
  private volume: number = 0.35; // default 35% volume
  private previewTimeout: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentAmbient(): AmbientSoundId {
    return this.currentAmbient;
  }

  public isPlaying(): boolean {
    return this.isRunning;
  }

  public stop() {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    if (this.masterGain && this.ctx) {
      // Gentle fade-out
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      setTimeout(() => {
        this.cleanupNodes();
        this.isRunning = false;
        this.currentAmbient = 'none';
      }, 120);
    } else {
      this.cleanupNodes();
      this.isRunning = false;
      this.currentAmbient = 'none';
    }
  }

  private cleanupNodes() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {
        // ignore already stopped nodes
      }
    });
    this.activeNodes = [];
  }

  public start(ambientId: AmbientSoundId, customVolume?: number) {
    if (ambientId === 'none') {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.cleanupNodes();
    if (customVolume !== undefined) {
      this.setVolume(customVolume);
    } else {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }

    this.currentAmbient = ambientId;
    this.isRunning = true;

    switch (ambientId) {
      case 'folk_cafe':
        this.createFolkCafeSoundscape();
        break;
      case 'heritage_souq':
        this.createHeritageSouqSoundscape();
        break;
      case 'desert_calm':
        this.createDesertCalmSoundscape();
        break;
      case 'saudi_majlis':
        this.createSaudiMajlisSoundscape();
        break;
      case 'sea_breeze':
        this.createSeaBreezeSoundscape();
        break;
      case 'asir_rain':
        this.createAsirRainSoundscape();
        break;
      case 'diriyah_evening':
        this.createDiriyahEveningSoundscape();
        break;
      default:
        break;
    }
  }

  public preview(ambientId: AmbientSoundId, durationMs: number = 8000, onEnd?: () => void) {
    this.start(ambientId);
    if (this.previewTimeout) clearTimeout(this.previewTimeout);
    this.previewTimeout = setTimeout(() => {
      this.stop();
      if (onEnd) onEnd();
    }, durationMs);
  }

  // -------------------------------------------------------------
  // SOUNDSCAPE GENERATORS (Realistic Procedural Acoustic Layers)
  // -------------------------------------------------------------

  /**
   * 1. خلفية مقهى شعبي (Traditional Folk Cafe)
   * Warm crowd murmur pink noise + ceramic tea glasses & spoon clinks + subtle room resonance
   */
  private createFolkCafeSoundscape() {
    if (!this.ctx || !this.masterGain) return;

    // Crowd Murmur Bed (Layered Bandpass Pink Noise)
    const murmurBuffer = this.createNoiseBuffer(5, 'pink');
    const murmurSource = this.ctx.createBufferSource();
    murmurSource.buffer = murmurBuffer;
    murmurSource.loop = true;

    const murmurFilter1 = this.ctx.createBiquadFilter();
    murmurFilter1.type = 'bandpass';
    murmurFilter1.frequency.value = 450;
    murmurFilter1.Q.value = 1.2;

    const murmurGain = this.ctx.createGain();
    murmurGain.gain.value = 0.35;

    murmurSource.connect(murmurFilter1);
    murmurFilter1.connect(murmurGain);
    murmurGain.connect(this.masterGain);
    murmurSource.start();
    this.activeNodes.push(murmurSource, murmurGain);

    // Warm Room Tone Rumble (Brown Noise)
    const roomBuffer = this.createNoiseBuffer(4, 'brown');
    const roomSource = this.ctx.createBufferSource();
    roomSource.buffer = roomBuffer;
    roomSource.loop = true;

    const roomFilter = this.ctx.createBiquadFilter();
    roomFilter.type = 'lowpass';
    roomFilter.frequency.value = 250;

    const roomGain = this.ctx.createGain();
    roomGain.gain.value = 0.25;

    roomSource.connect(roomFilter);
    roomFilter.connect(roomGain);
    roomGain.connect(this.masterGain);
    roomSource.start();
    this.activeNodes.push(roomSource, roomGain);

    // Occasional subtle spoon/cup clink intervals
    const clinkInterval = setInterval(() => {
      if (!this.isRunning || this.currentAmbient !== 'folk_cafe' || !this.ctx) {
        clearInterval(clinkInterval);
        return;
      }
      this.triggerCupClink(0.12 + Math.random() * 0.15, 2200 + Math.random() * 800);
    }, 2800 + Math.random() * 2000);

    this.activeNodes.push({ disconnect: () => clearInterval(clinkInterval) });
  }

  /**
   * 2. أصوات السوق القديم (Heritage Souq / Traditional Bazaar)
   * Deep alley reverberant clamor + footsteps on stone + distant vendor acoustics
   */
  private createHeritageSouqSoundscape() {
    if (!this.ctx || !this.masterGain) return;

    // Bazaar Ambient Hum
    const souqNoise = this.createNoiseBuffer(6, 'pink');
    const souqSource = this.ctx.createBufferSource();
    souqSource.buffer = souqNoise;
    souqSource.loop = true;

    const souqFilter = this.ctx.createBiquadFilter();
    souqFilter.type = 'bandpass';
    souqFilter.frequency.value = 650;
    souqFilter.Q.value = 0.9;

    const souqGain = this.ctx.createGain();
    souqGain.gain.value = 0.32;

    souqSource.connect(souqFilter);
    souqFilter.connect(souqGain);
    souqGain.connect(this.masterGain);
    souqSource.start();
    this.activeNodes.push(souqSource, souqGain);

    // Echoey alleyway air resonance
    const echoNoise = this.createNoiseBuffer(5, 'brown');
    const echoSource = this.ctx.createBufferSource();
    echoSource.buffer = echoNoise;
    echoSource.loop = true;

    const echoFilter = this.ctx.createBiquadFilter();
    echoFilter.type = 'lowpass';
    echoFilter.frequency.value = 380;

    const echoGain = this.ctx.createGain();
    echoGain.gain.value = 0.22;

    echoSource.connect(echoFilter);
    echoFilter.connect(echoGain);
    echoGain.connect(this.masterGain);
    echoSource.start();
    this.activeNodes.push(echoSource, echoGain);

    // Subtle rhythmic background rustle/steps
    const stepInterval = setInterval(() => {
      if (!this.isRunning || this.currentAmbient !== 'heritage_souq' || !this.ctx) {
        clearInterval(stepInterval);
        return;
      }
      this.triggerStepRustle(0.08 + Math.random() * 0.08);
    }, 1900 + Math.random() * 1500);

    this.activeNodes.push({ disconnect: () => clearInterval(stepInterval) });
  }

  /**
   * 3. صوت هدوء وسكون الصحراء (Desert Serenity & Night Wind)
   * Sweeping smooth dune breeze + campfire wood embers crackle + peaceful stillness
   */
  private createDesertCalmSoundscape() {
    if (!this.ctx || !this.masterGain) return;

    // Desert Wind Gentle Sweeps (Modulated Lowpass Pink Noise)
    const windBuffer = this.createNoiseBuffer(6, 'pink');
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 320;

    // LFO for slow desert wind breathing modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.18; // Slow breath 0.18 Hz
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 160; // oscillate cutoff by +-160 Hz
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    lfo.start();

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.4;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);
    windSource.start();
    this.activeNodes.push(windSource, lfo, windGain);

    // Campfire Embers Soft Crackle
    const crackleInterval = setInterval(() => {
      if (!this.isRunning || this.currentAmbient !== 'desert_calm' || !this.ctx) {
        clearInterval(crackleInterval);
        return;
      }
      this.triggerCampfireCrackle(0.1 + Math.random() * 0.15);
    }, 600 + Math.random() * 800);

    this.activeNodes.push({ disconnect: () => clearInterval(crackleInterval) });
  }

  /**
   * 4. أجواء المجلس وضيافة القهوة النجدية (Saudi Majlis & Coffee Hospitality)
   * Pouring dallah coffee stream simulation + fine finjan porcelain clinks
   */
  private createSaudiMajlisSoundscape() {
    if (!this.ctx || !this.masterGain) return;

    // Soft quiet indoor atmosphere
    const majlisBuffer = this.createNoiseBuffer(4, 'brown');
    const majlisSource = this.ctx.createBufferSource();
    majlisSource.buffer = majlisBuffer;
    majlisSource.loop = true;

    const majlisFilter = this.ctx.createBiquadFilter();
    majlisFilter.type = 'lowpass';
    majlisFilter.frequency.value = 220;

    const majlisGain = this.ctx.createGain();
    majlisGain.gain.value = 0.2;

    majlisSource.connect(majlisFilter);
    majlisFilter.connect(majlisGain);
    majlisGain.connect(this.masterGain);
    majlisSource.start();
    this.activeNodes.push(majlisSource, majlisGain);

    // Periodic authentic coffee pouring and finjan clink
    const coffeeInterval = setInterval(() => {
      if (!this.isRunning || this.currentAmbient !== 'saudi_majlis' || !this.ctx) {
        clearInterval(coffeeInterval);
        return;
      }
      this.triggerCoffeePour();
      setTimeout(() => {
        if (this.isRunning && this.currentAmbient === 'saudi_majlis') {
          this.triggerCupClink(0.2, 2800);
        }
      }, 700);
    }, 4500 + Math.random() * 3000);

    // Initial pour right away
    setTimeout(() => {
      if (this.isRunning && this.currentAmbient === 'saudi_majlis') {
        this.triggerCoffeePour();
      }
    }, 400);

    this.activeNodes.push({ disconnect: () => clearInterval(coffeeInterval) });
  }

  /**
   * 5. شاطئ البحر وكورنيش الحجاز والشرقية (Sea Breeze & Coastline Waves)
   * Harmonic rolling ocean tides & gentle coastal wind
   */
  private createSeaBreezeSoundscape() {
    if (!this.ctx || !this.masterGain) return;

    // Wave Surf Noise
    const waveBuffer = this.createNoiseBuffer(8, 'pink');
    const waveSource = this.ctx.createBufferSource();
    waveSource.buffer = waveBuffer;
    waveSource.loop = true;

    const waveFilter = this.ctx.createBiquadFilter();
    waveFilter.type = 'lowpass';
    waveFilter.frequency.value = 400;

    // Wave cycle LFO (0.12 Hz for slow oceanic swelling)
    const waveLfo = this.ctx.createOscillator();
    waveLfo.frequency.value = 0.12;
    const waveLfoGain = this.ctx.createGain();
    waveLfoGain.gain.value = 0.35;

    const waveGain = this.ctx.createGain();
    waveGain.gain.value = 0.25;

    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(waveGain.gain);
    waveLfo.start();

    waveSource.connect(waveFilter);
    waveFilter.connect(waveGain);
    waveGain.connect(this.masterGain);
    waveSource.start();
    this.activeNodes.push(waveSource, waveLfo, waveGain);
  }

  /**
   * 6. مطر عسير وخيرات الجنوب (Asir Rain & Highlands Mist)
   * Refreshing raindrops pattering + gentle mountain breeze
   */
  private createAsirRainSoundscape() {
    if (!this.ctx || !this.masterGain) return;

    // Continuous Rain Sheet
    const rainBuffer = this.createNoiseBuffer(5, 'pink');
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'highpass';
    rainFilter.frequency.value = 1000;

    const rainGain = this.ctx.createGain();
    rainGain.gain.value = 0.32;

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);
    rainSource.start();
    this.activeNodes.push(rainSource, rainGain);

    // Individual droplet bursts
    const dropletInterval = setInterval(() => {
      if (!this.isRunning || this.currentAmbient !== 'asir_rain' || !this.ctx) {
        clearInterval(dropletInterval);
        return;
      }
      this.triggerRainDroplet(0.08 + Math.random() * 0.08);
    }, 250 + Math.random() * 300);

    this.activeNodes.push({ disconnect: () => clearInterval(dropletInterval) });
  }

  /**
   * 7. سكون واحات النخيل ومساء الدرعية (Diriyah Evening Oasis)
   * Rustling palm fronds + soothing night cricket chirps
   */
  private createDiriyahEveningSoundscape() {
    if (!this.ctx || !this.masterGain) return;

    // Oasis Palm Breeze
    const oasisBuffer = this.createNoiseBuffer(6, 'pink');
    const oasisSource = this.ctx.createBufferSource();
    oasisSource.buffer = oasisBuffer;
    oasisSource.loop = true;

    const oasisFilter = this.ctx.createBiquadFilter();
    oasisFilter.type = 'bandpass';
    oasisFilter.frequency.value = 350;
    oasisFilter.Q.value = 1.0;

    const oasisGain = this.ctx.createGain();
    oasisGain.gain.value = 0.28;

    oasisSource.connect(oasisFilter);
    oasisFilter.connect(oasisGain);
    oasisGain.connect(this.masterGain);
    oasisSource.start();
    this.activeNodes.push(oasisSource, oasisGain);

    // Gentle night crickets
    const cricketOsc = this.ctx.createOscillator();
    cricketOsc.type = 'sine';
    cricketOsc.frequency.value = 4600;

    const cricketAmp = this.ctx.createOscillator();
    cricketAmp.type = 'square';
    cricketAmp.frequency.value = 14; // fast 14Hz chirp pulses

    const cricketAmpGain = this.ctx.createGain();
    cricketAmpGain.gain.value = 0.04;
    cricketAmp.connect(cricketAmpGain);

    const cricketGain = this.ctx.createGain();
    cricketGain.gain.value = 0.035;

    cricketOsc.connect(cricketGain);
    cricketGain.connect(this.masterGain);

    cricketOsc.start();
    cricketAmp.start();
    this.activeNodes.push(cricketOsc, cricketAmp, cricketGain);
  }

  // -------------------------------------------------------------
  // PROCEDURAL SOUND EFFECT HELPERS
  // -------------------------------------------------------------

  /**
   * Generates a tuned porcelain/glass cup clink
   */
  private triggerCupClink(intensity: number = 0.15, freq: number = 2400) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.92, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(intensity, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  /**
   * Generates a coffee stream pouring sound
   */
  private triggerCoffeePour() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(0.9, 'pink');
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1400, this.ctx.currentTime + 0.6);
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.15);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.85);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    source.stop(this.ctx.currentTime + 0.9);
  }

  /**
   * Generates campfire wood snap/sparkle
   */
  private triggerCampfireCrackle(intensity: number = 0.1) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 1800, this.ctx.currentTime);

    gain.gain.setValueAtTime(intensity, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Generates single raindrop ping
   */
  private triggerRainDroplet(intensity: number = 0.08) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 1200 + Math.random() * 1200;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(intensity, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  /**
   * Generates market step / rustle
   */
  private triggerStepRustle(intensity: number = 0.06) {
    if (!this.ctx || !this.masterGain) return;
    const noise = this.createNoiseBuffer(0.12, 'brown');
    const source = this.ctx.createBufferSource();
    source.buffer = noise;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(intensity, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    source.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    source.stop(this.ctx.currentTime + 0.13);
  }

  /**
   * Helper to create White, Pink, or Brown noise buffers
   */
  private createNoiseBuffer(seconds: number, type: 'white' | 'pink' | 'brown' = 'white'): AudioBuffer {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }
    }
    return buffer;
  }

  /**
   * Offline mixdown: Blends TTS Voice PCM and procedural Ambient track
   * into a unified downloadable 24kHz WAV Blob.
   */
  public async renderMixedWavBlob(
    voiceBase64Pcm: string,
    ambientId: AmbientSoundId,
    ambientVolume: number = 0.35,
    sampleRate: number = 24000
  ): Promise<Blob> {
    if (ambientId === 'none') {
      // Return voice directly
      return (await import('./audioUtils')).pcmToWavBlob(voiceBase64Pcm, sampleRate);
    }

    const voiceBytes = base64ToUint8Array(voiceBase64Pcm);
    const numSamples = Math.floor(voiceBytes.length / 2);
    const durationSeconds = numSamples / sampleRate;

    // Use OfflineAudioContext for fast rendering
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtx(1, Math.max(1, Math.floor(sampleRate * (durationSeconds + 0.4))), sampleRate);

    // 1. Voice Track
    const voiceBuffer = offlineCtx.createBuffer(1, numSamples, sampleRate);
    const voiceChannel = voiceBuffer.getChannelData(0);
    const dataView = new DataView(voiceBytes.buffer, voiceBytes.byteOffset, voiceBytes.byteLength);

    for (let i = 0; i < numSamples; i++) {
      const sample = dataView.getInt16(i * 2, true);
      voiceChannel[i] = sample / 32768;
    }

    const voiceSource = offlineCtx.createBufferSource();
    voiceSource.buffer = voiceBuffer;
    voiceSource.connect(offlineCtx.destination);
    voiceSource.start(0);

    // 2. Ambient Procedural Track rendered offline
    const ambientGain = offlineCtx.createGain();
    ambientGain.gain.value = Math.max(0.05, Math.min(1, ambientVolume * 0.7));
    ambientGain.connect(offlineCtx.destination);

    // Create ambient noise bed for the full duration
    const ambientBuffer = this.createNoiseBuffer(durationSeconds + 0.5, 'pink');
    const ambientSource = offlineCtx.createBufferSource();
    ambientSource.buffer = ambientBuffer;

    const ambientFilter = offlineCtx.createBiquadFilter();
    if (ambientId === 'folk_cafe') {
      ambientFilter.type = 'bandpass';
      ambientFilter.frequency.value = 450;
      ambientFilter.Q.value = 1.2;
    } else if (ambientId === 'heritage_souq') {
      ambientFilter.type = 'bandpass';
      ambientFilter.frequency.value = 600;
    } else if (ambientId === 'desert_calm') {
      ambientFilter.type = 'lowpass';
      ambientFilter.frequency.value = 320;
    } else if (ambientId === 'sea_breeze') {
      ambientFilter.type = 'lowpass';
      ambientFilter.frequency.value = 420;
    } else if (ambientId === 'asir_rain') {
      ambientFilter.type = 'highpass';
      ambientFilter.frequency.value = 1000;
    } else {
      ambientFilter.type = 'lowpass';
      ambientFilter.frequency.value = 350;
    }

    ambientSource.connect(ambientFilter);
    ambientFilter.connect(ambientGain);
    ambientSource.start(0);

    // Render Audio
    const renderedBuffer = await offlineCtx.startRendering();
    const renderedData = renderedBuffer.getChannelData(0);

    // Convert float32 back to 16-bit PCM
    const outputPcm = new Int16Array(renderedData.length);
    for (let i = 0; i < renderedData.length; i++) {
      const s = Math.max(-1, Math.min(1, renderedData[i]));
      outputPcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Convert Int16 to base64
    let binary = '';
    const bytes = new Uint8Array(outputPcm.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const mixedBase64 = btoa(binary);

    const { pcmToWavBlob } = await import('./audioUtils');
    return pcmToWavBlob(mixedBase64, sampleRate);
  }
}

export const ambientEngine = new AmbientAudioEngine();
