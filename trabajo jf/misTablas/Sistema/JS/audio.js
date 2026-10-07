/**
 * audio.js - Sistema de Efectos Sonoros con Web Audio API
 * Genera sonidos dinámicos sin requerir archivos externos de audio.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('multiAventura_sound') !== 'false';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('multiAventura_sound', this.enabled);
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1, delay = 0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('Audio no disponible:', e);
    }
  }

  playClick() {
    this.playTone(600, 'sine', 0.05, 0.08);
  }

  playCardFlip() {
    this.playTone(400, 'triangle', 0.08, 0.07);
  }

  playSuccess() {
    // Acorde feliz ascendente: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.18, 0.12, idx * 0.08);
    });
  }

  playError() {
    // Sonido suave y no punitivo: tono descendente
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(180, startTime + 0.25);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    } catch (e) {}
  }

  playLevelUp() {
    // Fanfarria victoriosa
    const melody = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.12, t: 0.24 },
      { f: 1046.50, d: 0.35, t: 0.36 }
    ];
    melody.forEach(item => {
      this.playTone(item.f, 'triangle', item.d, 0.15, item.t);
    });
  }

  playStar() {
    // Brillo estelar
    this.playTone(880, 'sine', 0.1, 0.1, 0);
    this.playTone(1320, 'sine', 0.2, 0.12, 0.08);
  }
}

window.soundSys = new SoundSystem();
