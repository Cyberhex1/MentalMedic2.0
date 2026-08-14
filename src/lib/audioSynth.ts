import { AudioType } from '../types';

const MOODIST_BASE = 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds';

const SOUND_URLS: Record<string, string> = {
  brown: `${MOODIST_BASE}/brown-noise.mp3`,
  cute_hyper: 'synth', // Procedurally synthesized
};

export class MultiTrackSynthesizer {
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.5;
  
  // Storage for standard looping audio elements and synthesizers
  private activeSoundscapes: Map<string, { audio?: HTMLAudioElement; synth?: any; volume: number }> = new Map();

  constructor() {}

  public initCtx() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn('AudioContext not supported');
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    [...this.activeSoundscapes.entries()].forEach(([type, track]) => {
      this.setSoundscapeVolume(type as AudioType, track.volume);
    });
  }

  public playClickSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + 0.001;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.02);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04 * this.masterVolume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  public playTabSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(550, now + 0.03);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03 * this.masterVolume, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public playChime() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.85);
    } catch {}
  }

  private playBouncyBell(frequency: number, trackVol: number) {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, now);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06 * trackVol * this.masterVolume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch {}
  }

  private startCuteHyperSynth(volume: number): any {
    const scale = [349.23, 392.00, 440.00, 523.25, 587.33, 698.46]; // F4, G4, A4, C5, D5, F5
    let activeVol = volume;
    
    const playNext = () => {
      const note = scale[Math.floor(Math.random() * scale.length)];
      this.playBouncyBell(note, activeVol);
    };
    
    playNext();
    const intervalId = setInterval(playNext, 650);
    
    return {
      setVolume: (vol: number) => {
        activeVol = vol;
      },
      stop: () => {
        clearInterval(intervalId);
      }
    };
  }

  // --- REAL SOUNDSCAPES ---
  
  public isSoundscapeActive(type: AudioType): boolean {
    return this.activeSoundscapes.has(type);
  }
  
  public getSoundscapeVolume(type: AudioType): number {
    return this.activeSoundscapes.get(type)?.volume ?? 0.5;
  }
  
  public setSoundscapeVolume(type: AudioType, volume: number) {
    const vol = Math.max(0, Math.min(1, volume));
    const track = this.activeSoundscapes.get(type);
    if (track) {
      track.volume = vol;
      try {
        if (track.audio) {
          track.audio.volume = vol * this.masterVolume;
        }
        if (track.synth && typeof track.synth.setVolume === 'function') {
          track.synth.setVolume(vol);
        }
      } catch {}
    }
  }

  public playSoundscape(type: AudioType, volume: number = 0.5) {
    // Single sound stream: stop all other soundscapes before starting the new one
    [...this.activeSoundscapes.keys()].forEach((k) => {
      if (k !== type) {
        this.stopSoundscape(k as AudioType);
      }
    });

    if (this.activeSoundscapes.has(type)) {
      this.setSoundscapeVolume(type, volume);
      return;
    }

    const url = SOUND_URLS[type];
    if (!url) {
      console.warn(`No audio URL found for soundscape ${type}`);
      return;
    }

    if (url === 'synth') {
      try {
        let synth: any = null;
        if (type === 'cute_hyper') {
          synth = this.startCuteHyperSynth(volume);
        }
        
        if (synth) {
          this.activeSoundscapes.set(type, { synth, volume });
        }
      } catch (e) {
        console.warn(`Error starting synth soundscape ${type}`, e);
      }
      return;
    }

    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = volume * this.masterVolume;
      
      audio.play().catch((err) => {
        console.warn(`Autoplay blocked for soundscape ${type}. Will retry on next click.`, err);
      });

      this.activeSoundscapes.set(type, { audio, volume });
    } catch (e) {
      console.warn(`Error starting soundscape ${type}`, e);
    }
  }

  public stopSoundscape(type: AudioType) {
    const track = this.activeSoundscapes.get(type);
    if (track) {
      if (track.synth) {
        try {
          track.synth.stop();
        } catch {}
      } else if (track.audio) {
        try {
          let currentVol = track.volume * this.masterVolume;
          const steps = 10;
          const stepTime = 50; // ms
          const volStep = currentVol / steps;
          
          let currentStep = 0;
          const fadeOut = setInterval(() => {
            currentStep++;
            currentVol = Math.max(0, currentVol - volStep);
            
            if (track.audio) {
              track.audio.volume = currentVol;
            }
            
            if (currentStep >= steps) {
              clearInterval(fadeOut);
              try {
                if (track.audio) {
                  track.audio.pause();
                  track.audio.currentTime = 0;
                }
              } catch {}
            }
          }, stepTime);
        } catch {
          track.audio.pause();
          track.audio.currentTime = 0;
        }
      }
      this.activeSoundscapes.delete(type);
    }
  }

  public stopAllSoundscapes() {
    [...this.activeSoundscapes.keys()].forEach((k) => this.stopSoundscape(k as AudioType));
  }
}

export const audioSynth = new MultiTrackSynthesizer();
