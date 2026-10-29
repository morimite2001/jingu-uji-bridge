/**
 * Procedural Web Audio Engine for Ise Jingu Uji Bridge
 * Generates natural ambient Isuzu river flow and shrine chime tones with zero external audio files.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private riverNode: AudioNode | null = null;
  private riverGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private isMuted = true;
  private volume = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createRiverNoise() {
    if (!this.ctx || !this.masterGain) return;

    // 4 seconds of procedural stereo pink noise buffer
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.038;
        b6 = white * 0.115926;
      }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to simulate river rushing water (lowpass + bandpass)
    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(780, this.ctx.currentTime);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'peaking';
    filter2.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter2.Q.setValueAtTime(1.8, this.ctx.currentTime);
    filter2.gain.setValueAtTime(6.0, this.ctx.currentTime);

    this.riverGain = this.ctx.createGain();
    this.riverGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    noiseSource.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(this.riverGain);
    this.riverGain.connect(this.masterGain);

    noiseSource.start();
    this.riverNode = noiseSource;
    this.isPlaying = true;
  }

  public toggleMute(): boolean {
    this.initContext();
    if (!this.ctx || !this.masterGain) return true;

    if (!this.isPlaying) {
      this.createRiverNoise();
    }

    this.isMuted = !this.isMuted;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume, now + 0.3);

    return this.isMuted;
  }

  public playShrineChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const freqs = [587.33, 880.0, 1174.66]; // Re, La, Re high harmonic chime
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4 - idx * 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();
