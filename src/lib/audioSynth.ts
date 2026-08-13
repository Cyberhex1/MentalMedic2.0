import { AudioType, OfficeAudioType } from '../types';

const MOODIST_BASE = 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds';

const SOUND_URLS: Record<string, string> = {
  brown: `${MOODIST_BASE}/brown-noise.mp3`,
  pink: `${MOODIST_BASE}/pink-noise.mp3`,
  white: `${MOODIST_BASE}/white-noise.mp3`,
  rain: `${MOODIST_BASE}/light-rain.mp3`,
  binaural: 'synth', // Synthesized on-the-fly
  drone: 'synth', // Synthesized on-the-fly
  office: `${MOODIST_BASE}/ceiling-fan.mp3`,
  cafe: `${MOODIST_BASE}/cafe.mp3`,
  keyboard: `${MOODIST_BASE}/keyboard.mp3`,
  coffee: `${MOODIST_BASE}/cafe.mp3`,
  medieval: 'https://upload.wikimedia.org/wikipedia/commons/2/29/J.S._Bach_Bourr%C3%A9e_in_E_minor_on_classical_guitar.mp3', // Authentic classical guitar lute
  lofi: 'https://archive.org/download/chill-vibes-vol.-1-lofi-528/01.%20Ethereal%20Drift.mp3', // Premium lofi beat
  cute_hyper: 'synth', // Procedurally synthesized
  cute_chill: 'synth', // Procedurally synthesized
  asmr_tapping: `${MOODIST_BASE}/keyboard.mp3`,
  asmr_rustle: `${MOODIST_BASE}/rain-on-window.mp3`,
  asmr_scratch: `${MOODIST_BASE}/fireplace.mp3`,
  park: `${MOODIST_BASE}/birds.mp3`,
  island_breeze: `${MOODIST_BASE}/waves.mp3`,

  walking: `${MOODIST_BASE}/train.mp3`,
  chair: `${MOODIST_BASE}/wind.mp3`,
  hvac: `${MOODIST_BASE}/ceiling-fan.mp3`,
  office_keyboard: `${MOODIST_BASE}/keyboard.mp3`,
  chatter: `${MOODIST_BASE}/playground.mp3`,
  pages: `${MOODIST_BASE}/rain-on-window.mp3`,
  page_flip: `${MOODIST_BASE}/rain-on-tent.mp3`,
  printer: `${MOODIST_BASE}/ceiling-fan.mp3`,
};

export class MultiTrackSynthesizer {
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.5;
  
  // Storage for standard looping audio elements and synthesizers
  private activeSoundscapes: Map<string, { audio?: HTMLAudioElement; synth?: any; volume: number }> = new Map();
  private activeOfficeAudio: Map<string, { audio: HTMLAudioElement; volume: number }> = new Map();

  // Fast-firing key click pool
  private keyClickPool: HTMLAudioElement[] = [];
  private currentPoolIndex: number = 0;
  private POOL_SIZE = 6;

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
      this.ctx.resume().catch(() => {});
    }
    this.initKeyClickPool();
  }

  private initKeyClickPool() {
    if (this.keyClickPool.length > 0) return;
    try {
      for (let i = 0; i < this.POOL_SIZE; i++) {
        const audio = new Audio(`${MOODIST_BASE}/things/keyboard.mp3`);
        audio.preload = 'auto';
        audio.volume = 0.08;
        this.keyClickPool.push(audio);
      }
    } catch (e) {
      console.warn("Failed to initialize key click pool", e);
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    
    // Update active soundscapes volume
    this.activeSoundscapes.forEach((track) => {
      try {
        if (track.audio) {
          track.audio.volume = track.volume * this.masterVolume;
        }
        if (track.synth && typeof track.synth.setVolume === 'function') {
          track.synth.setVolume(track.volume);
        }
      } catch {}
    });

    // Update active office audio volume
    this.activeOfficeAudio.forEach((track) => {
      try {
        track.audio.volume = track.volume * this.masterVolume;
      } catch {}
    });
  }

  public stopAll() {
    this.stopAllSoundscapes();
    [...this.activeOfficeAudio.keys()].forEach((k) => this.stopOfficeAudio(k as OfficeAudioType));
  }

  public stopAllSoundscapes() {
    [...this.activeSoundscapes.keys()].forEach((k) => this.stopSoundscape(k as AudioType));
  }

  // --- UI SOUNDS (Warm, pop-free synthesis) ---

  public playClickSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.04);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04 * this.masterVolume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch {}
  }

  public playSuccessSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + 0.005;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        
        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.05 * this.masterVolume, now + i * 0.07 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.22);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.23);
      });
    } catch {}
  }

  public playLevelUpSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + 0.005;
      const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      arpeggio.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        
        gain.gain.setValueAtTime(0, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.08 * this.masterVolume, now + i * 0.06 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.35);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.36);
      });
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

  // Rapid mechanical keyboard typing sound using high-performance pool
  public playKeyClickSound() {
    try {
      this.initKeyClickPool();
      if (this.keyClickPool.length === 0) {
        this.playSyntheticKeyClick();
        return;
      }
      
      const audio = this.keyClickPool[this.currentPoolIndex];
      this.currentPoolIndex = (this.currentPoolIndex + 1) % this.POOL_SIZE;
      
      audio.volume = 0.06 * this.masterVolume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        this.playSyntheticKeyClick();
      });
    } catch {
      this.playSyntheticKeyClick();
    }
  }

  private playSyntheticKeyClick() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + 0.001;
      const isSpace = Math.random() < 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSpace ? 150 : 280, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 60 : 120, now + 0.015);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isSpace ? 500 : 1000, now);
      filter.Q.setValueAtTime(2.0, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime((isSpace ? 0.02 : 0.01) * this.masterVolume, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch {}
  }

  // --- SYNTHESIZERS AND PROCEDURAL MUSIC GENERATORS ---

  private startBinauralSynth(volume: number): any {
    this.initCtx();
    if (!this.ctx) return null;
    const ctx = this.ctx;
    
    // Create nodes
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    const gainL = ctx.createGain();
    const gainR = ctx.createGain();
    const masterGain = ctx.createGain();
    
    // Binaural focus frequencies: 200Hz in left ear, 240Hz in right ear -> 40Hz beat
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(200, ctx.currentTime);
    
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(240, ctx.currentTime);
    
    gainL.gain.setValueAtTime(0.5, ctx.currentTime);
    gainR.gain.setValueAtTime(0.5, ctx.currentTime);
    masterGain.gain.setValueAtTime(volume * this.masterVolume, ctx.currentTime);
    
    if (ctx.createStereoPanner) {
      const pannerL = ctx.createStereoPanner();
      pannerL.pan.setValueAtTime(-1, ctx.currentTime);
      const pannerR = ctx.createStereoPanner();
      pannerR.pan.setValueAtTime(1, ctx.currentTime);
      
      oscL.connect(gainL);
      gainL.connect(pannerL);
      pannerL.connect(masterGain);
      
      oscR.connect(gainR);
      gainR.connect(pannerR);
      pannerR.connect(masterGain);
    } else {
      const merger = ctx.createChannelMerger(2);
      oscL.connect(gainL).connect(merger, 0, 0);
      oscR.connect(gainR).connect(merger, 0, 1);
      merger.connect(masterGain);
    }
    
    masterGain.connect(ctx.destination);
    
    oscL.start();
    oscR.start();
    
    return {
      setVolume: (vol: number) => {
        masterGain.gain.setValueAtTime(vol * this.masterVolume, ctx.currentTime);
      },
      stop: () => {
        try {
          oscL.stop();
          oscR.stop();
        } catch {}
        try {
          oscL.disconnect();
          oscR.disconnect();
          masterGain.disconnect();
        } catch {}
      }
    };
  }

  private startDroneSynth(volume: number): any {
    this.initCtx();
    if (!this.ctx) return null;
    const ctx = this.ctx;
    
    const oscillators: OscillatorNode[] = [];
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);
    
    const freqs = [108, 216, 324, 432, 528];
    const waves: OscillatorType[] = ['triangle', 'sine', 'triangle', 'sine', 'sine'];
    const oscGains = [0.3, 0.4, 0.2, 0.15, 0.1];
    
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = waves[i];
      const detune = (Math.random() - 0.5) * 6; 
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(detune, ctx.currentTime);
      
      oscGain.gain.setValueAtTime(oscGains[i], ctx.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(filter);
      
      osc.start();
      oscillators.push(osc);
    });
    
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    oscillators.push(lfo);
    
    masterGain.gain.setValueAtTime(volume * this.masterVolume, ctx.currentTime);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    
    return {
      setVolume: (vol: number) => {
        masterGain.gain.setValueAtTime(vol * this.masterVolume, ctx.currentTime);
      },
      stop: () => {
        oscillators.forEach(osc => {
          try {
            osc.stop();
          } catch {}
          try {
            osc.disconnect();
          } catch {}
        });
        try {
          masterGain.disconnect();
          filter.disconnect();
          lfoGain.disconnect();
        } catch {}
      }
    };
  }

  private playCozyChime(frequency: number, trackVol: number) {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = this.ctx.createDelay();
      const delayGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08 * trackVol * this.masterVolume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
      
      delay.delayTime.setValueAtTime(0.35, now);
      delayGain.gain.setValueAtTime(0.3, now);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(this.ctx.destination);
      delayGain.connect(delay); // feedback
      
      osc.start(now);
      osc.stop(now + 2.1);
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

  private startCuteChillSynth(volume: number): any {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    let activeVol = volume;
    
    const playNext = () => {
      const note = scale[Math.floor(Math.random() * scale.length)];
      const detunedNote = note * (1 + (Math.random() - 0.5) * 0.012);
      this.playCozyChime(detunedNote, activeVol);
    };
    
    playNext();
    const intervalId = setInterval(playNext, 2500);
    
    return {
      setVolume: (vol: number) => {
        activeVol = vol;
      },
      stop: () => {
        clearInterval(intervalId);
      }
    };
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
        if (type === 'binaural') {
          synth = this.startBinauralSynth(volume);
        } else if (type === 'drone') {
          synth = this.startDroneSynth(volume);
        } else if (type === 'cute_chill') {
          synth = this.startCuteChillSynth(volume);
        } else if (type === 'cute_hyper') {
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
          
          let count = 0;
          const fadeInterval = setInterval(() => {
            try {
              count++;
              currentVol = Math.max(0, currentVol - volStep);
              if (track.audio) {
                track.audio.volume = currentVol;
              }
              if (count >= steps) {
                clearInterval(fadeInterval);
                if (track.audio) {
                  track.audio.pause();
                  track.audio.remove();
                }
              }
            } catch {
              clearInterval(fadeInterval);
            }
          }, stepTime);
        } catch {
          try {
            if (track.audio) {
              track.audio.pause();
            }
          } catch {}
        }
      }
      this.activeSoundscapes.delete(type);
    }
  }

  public toggleSoundscape(type: AudioType, volume: number = 0.5) {
    if (this.isSoundscapeActive(type)) {
      this.stopSoundscape(type);
    } else {
      this.playSoundscape(type, volume);
    }
  }

  // --- OFFICE SOUNDS ---
  
  public isOfficeAudioActive(type: OfficeAudioType): boolean {
    return this.activeOfficeAudio.has(type);
  }
  
  public getOfficeAudioVolume(type: OfficeAudioType): number {
    return this.activeOfficeAudio.get(type)?.volume ?? 0.5;
  }
  
  public setOfficeAudioVolume(type: OfficeAudioType, volume: number) {
    const vol = Math.max(0, Math.min(1, volume));
    const track = this.activeOfficeAudio.get(type);
    if (track) {
      track.volume = vol;
      try {
        track.audio.volume = vol * this.masterVolume;
      } catch {}
    }
  }

  public playOfficeAudio(type: OfficeAudioType, volume: number = 0.5) {
    if (type === 'teams_ping' || type === 'email_ping') {
      this.triggerOfficePing(type);
      return;
    }

    if (this.activeOfficeAudio.has(type)) {
      this.setOfficeAudioVolume(type, volume);
      return;
    }

    const url = SOUND_URLS[type];
    if (!url) {
      console.warn(`No audio URL found for office audio ${type}`);
      return;
    }

    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = volume * this.masterVolume;
      
      audio.play().catch(() => {});

      this.activeOfficeAudio.set(type, { audio, volume });
    } catch (e) {
      console.warn(`Error starting office audio ${type}`, e);
    }
  }

  public stopOfficeAudio(type: OfficeAudioType) {
    const track = this.activeOfficeAudio.get(type);
    if (track) {
      try {
        let currentVol = track.volume * this.masterVolume;
        const steps = 10;
        const stepTime = 50;
        const volStep = currentVol / steps;
        
        let count = 0;
        const fadeInterval = setInterval(() => {
          try {
            count++;
            currentVol = Math.max(0, currentVol - volStep);
            track.audio.volume = currentVol;
            if (count >= steps) {
              clearInterval(fadeInterval);
              track.audio.pause();
              track.audio.remove();
            }
          } catch {
            clearInterval(fadeInterval);
          }
        }, stepTime);
      } catch {
        try {
          track.audio.pause();
        } catch {}
      }
      this.activeOfficeAudio.delete(type);
    }
  }

  public toggleOfficeAudio(type: OfficeAudioType, volume: number = 0.5) {
    if (this.isOfficeAudioActive(type)) {
      this.stopOfficeAudio(type);
    } else {
      this.playOfficeAudio(type, volume);
    }
  }

  // Elegant synthesized corporate chimes (100% pop-free)
  public triggerOfficePing(type: string) {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      if (type === 'teams_ping') {
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
      } else {
        // Email major chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      }
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08 * this.masterVolume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }
}

export const audioSynth = new MultiTrackSynthesizer();
