import type {
  AudienceGroup,
  AvatarExpression,
  AvatarState,
  CEFRLevel,
  ConnectionStatus,
  KidsAgeBand,
  LiveCorrection,
  PracticeDurationOption,
  PronunciationPointsAward,
  SpanishSupportMode,
  TranscriptTurn,
} from '../shared/tutorConfig';
import {
  computeRmsLevel,
  computeSyllableLipOpen,
  decodeBase64Pcm16ToFloat32,
  encodePcm16ToBase64,
  extractVisemeWeights,
  type VisemeWeights,
} from '../utils/audioPcm';

export interface LiveVoiceTelemetry {
  visemes: VisemeWeights;
  lipOpen: number;
  micLevel: number;
  tutorLevel: number;
  waveformBins: Uint8Array;
}

export interface LiveVoiceCallbacks {
  onConnectionChange: (status: ConnectionStatus, detail?: string) => void;
  onAvatarStateChange: (state: AvatarState) => void;
  onExpressionChange: (expression: AvatarExpression) => void;
  onMicLockChange?: (locked: boolean) => void;
  onSessionDurationChange?: (durationMinutes: number) => void;
  onTimeGoalReached?: (durationMinutes: number) => void;
  onTutorCaptionChange?: (caption: string) => void;
  onCorrection?: (correction: LiveCorrection) => void;
  onPointsAward?: (award: PronunciationPointsAward) => void;
  onSafetyNotice?: (message: string) => void;
  onError: (message: string) => void;
}

interface StartCallOptions {
  scenarioId: string;
  subtopicId?: string;
  previousSubtopicTitles?: string[];
  audience: AudienceGroup;
  kidsAgeBand?: KidsAgeBand;
  studentName?: string;
  practiceDuration?: PracticeDurationOption;
  cefrLevel: CEFRLevel;
  tutorId: string;
  spanishSupport: SpanishSupportMode;
  volume: number;
}

const WORKLET_CODE = `
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = new Float32Array(1024);
    this._offset = 0;
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channel = input[0];
    for (let i = 0; i < channel.length; i++) {
      this._buffer[this._offset++] = channel[i];
      if (this._offset >= this._buffer.length) {
        this.port.postMessage(this._buffer.slice(0));
        this._offset = 0;
      }
    }
    return true;
  }
}
registerProcessor('pcm-capture-processor', PcmCaptureProcessor);
`;

export class LiveVoiceClient {
  private callbacks: LiveVoiceCallbacks;
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private outputGain: GainNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private workletBlobUrl: string | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();

  private nextPlayTime = 0;
  private muted = false;
  private volume = 0.9;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private lastOptions: StartCallOptions | null = null;

  private avatarState: AvatarState = 'IDLE';
  private userSpeaking = false;
  private lastUserSpeechMs = 0;
  private interruptedUntilMs = 0;
  private awaitingTutorAfterSpeech = false;
  private hasCompletedTutorTurn = false;
  private silenceNudgeTimer: number | null = null;
  private consecutiveSilenceNudges = 0;

  // Strict half-duplex gate: block mic capture while AI is speaking or preparing a turn (+ echo tail)
  private tutorGenerating = false;
  private micLocked = false;
  private micUnlockTimer: number | null = null;

  // Silent transcript, correction & points memory for post-call report generation (never shown as chat UI)
  private transcriptTurns: TranscriptTurn[] = [];
  private liveCorrections: LiveCorrection[] = [];
  private totalPronunciationPoints = 0;
  private activeStudentChunk = '';
  private activeTutorChunk = '';
  private activeTutorCaption = '';
  private resetCaptionOnNextTutorText = true;

  // Pre-allocated buffers for 60Hz telemetry without GC allocations
  private outputFreqBins = new Uint8Array(128);
  private outputTimeDomain = new Uint8Array(256);
  private inputFreqBins = new Uint8Array(128);
  private latestMicLevel = 0;

  constructor(callbacks: LiveVoiceCallbacks) {
    this.callbacks = callbacks;
  }

  public async start(options: StartCallOptions): Promise<void> {
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    this.lastOptions = options;
    this.volume = options.volume;
    this.muted = false;
    this.transcriptTurns = [];
    this.liveCorrections = [];
    this.totalPronunciationPoints = 0;
    this.activeStudentChunk = '';
    this.activeTutorChunk = '';
    this.activeTutorCaption = '';
    this.resetCaptionOnNextTutorText = true;
    this.callbacks.onTutorCaptionChange?.('');
    this.hasCompletedTutorTurn = false;
    this.consecutiveSilenceNudges = 0;
    this.tutorGenerating = false;
    this.clearMicUnlockTimer();
    this.setMicLocked(false);
    this.clearSilenceNudgeTimer();

    this.callbacks.onConnectionChange('requesting_mic', 'Solicitando acceso al micrófono...');
    this.setAvatarState('IDLE');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg =
        'Tu navegador no soporta captura de micrófono en tiempo real. Usa Chrome, Edge o Safari actualizado.';
      this.callbacks.onConnectionChange('error', msg);
      this.callbacks.onError(msg);
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
        video: false,
      });
    } catch (err) {
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      const msg = isDenied
        ? 'Permiso de micrófono denegado. Habilita el micrófono en la barra del navegador para conversar con tu profesor.'
        : 'No se detectó un micrófono disponible en este dispositivo.';
      this.callbacks.onConnectionChange('error', msg);
      this.callbacks.onError(msg);
      return;
    }

    try {
      await this.setupAudioPipelines();
      this.openWebSocket(options, false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo inicializar el motor de audio en vivo.';
      this.releaseAllResources();
      this.callbacks.onConnectionChange('error', msg);
      this.callbacks.onError(msg);
    }
  }

  private async setupAudioPipelines(): Promise<void> {
    if (!this.mediaStream) throw new Error('Microphone stream missing.');

    // Input AudioContext for mic capture
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    this.inputCtx = new AudioCtx({ sampleRate: 16000 });
    if (this.inputCtx.state === 'suspended') {
      await this.inputCtx.resume();
    }

    const source = this.inputCtx.createMediaStreamSource(this.mediaStream);
    this.inputAnalyser = this.inputCtx.createAnalyser();
    this.inputAnalyser.fftSize = 256;
    this.inputAnalyser.smoothingTimeConstant = 0.72;
    source.connect(this.inputAnalyser);

    const handleMicChunk = (samples: Float32Array) => {
      // Strict half-duplex lock: while the AI is generating or speaking (plus echo tail),
      // completely block mic input so user voice or speaker bleed never interrupts or distorts the AI.
      if (
        this.muted ||
        !this.inputCtx ||
        this.micLocked ||
        this.tutorGenerating ||
        this.activeSources.size > 0
      ) {
        this.latestMicLevel = 0;
        return;
      }

      const rms = computeRmsLevel(samples);
      this.latestMicLevel = Math.min(1, rms * 4.5);
      const now = performance.now();

      // Voice Activity Detection for immediate visual responsiveness (student's turn only)
      const threshold = 0.018;
      if (rms > threshold) {
        this.lastUserSpeechMs = now;
        this.consecutiveSilenceNudges = 0;
        this.clearSilenceNudgeTimer();
        if (!this.userSpeaking) {
          this.userSpeaking = true;
          this.awaitingTutorAfterSpeech = false;
          if (now > this.interruptedUntilMs) {
            this.setAvatarState('LISTENING');
          }
        }
      } else if (this.userSpeaking && now - this.lastUserSpeechMs > 950) {
        this.userSpeaking = false;
        if (now > this.interruptedUntilMs) {
          this.awaitingTutorAfterSpeech = true;
          this.setAvatarState('THINKING');
        }
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const base64 = encodePcm16ToBase64(samples, this.inputCtx.sampleRate, 16000);
        this.ws.send(JSON.stringify({ type: 'audio', data: base64 }));
      }
    };

    // Prefer AudioWorkletNode for low-latency glitch-free capture; fallback to ScriptProcessorNode
    if (this.inputCtx.audioWorklet) {
      const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
      this.workletBlobUrl = URL.createObjectURL(blob);
      await this.inputCtx.audioWorklet.addModule(this.workletBlobUrl);
      this.workletNode = new AudioWorkletNode(this.inputCtx, 'pcm-capture-processor');
      this.workletNode.port.onmessage = (ev: MessageEvent<Float32Array>) => {
        if (ev.data instanceof Float32Array) {
          handleMicChunk(ev.data);
        }
      };
      source.connect(this.workletNode);
      // Connect through muted gain so worklet ticks without audio feedback
      const zeroGain = this.inputCtx.createGain();
      zeroGain.gain.value = 0;
      this.workletNode.connect(zeroGain);
      zeroGain.connect(this.inputCtx.destination);
    } else {
      this.scriptNode = this.inputCtx.createScriptProcessor(1024, 1, 1);
      this.scriptNode.onaudioprocess = (ev) => {
        handleMicChunk(ev.inputBuffer.getChannelData(0));
      };
      source.connect(this.scriptNode);
      const zeroGain = this.inputCtx.createGain();
      zeroGain.gain.value = 0;
      this.scriptNode.connect(zeroGain);
      zeroGain.connect(this.inputCtx.destination);
    }

    // Output AudioContext locked to 24kHz for Gemini Live native audio playback
    this.outputCtx = new AudioCtx({ sampleRate: 24000 });
    if (this.outputCtx.state === 'suspended') {
      await this.outputCtx.resume();
    }
    this.outputGain = this.outputCtx.createGain();
    this.outputGain.gain.value = this.volume;

    this.outputAnalyser = this.outputCtx.createAnalyser();
    this.outputAnalyser.fftSize = 256;
    // Lower smoothing constant (0.28) keeps mouth articulation crisply locked to every spoken syllable
    this.outputAnalyser.smoothingTimeConstant = 0.28;

    this.outputGain.connect(this.outputAnalyser);
    this.outputAnalyser.connect(this.outputCtx.destination);
  }

  private openWebSocket(options: StartCallOptions, isReconnect: boolean): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/api/live`;

    this.callbacks.onConnectionChange(
      isReconnect ? 'reconnecting' : 'connecting',
      isReconnect ? 'Reconectando con tu profesor...' : 'Conectando con Gemini Live...'
    );

    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.lockMicForTutorTurn();
      ws.send(
        JSON.stringify({
          type: 'init',
          scenarioId: options.scenarioId,
          subtopicId: options.subtopicId ?? '',
          previousSubtopicTitles: options.previousSubtopicTitles ?? [],
          audience: options.audience,
          kidsAgeBand: options.kidsAgeBand ?? '5-6',
          studentName: options.studentName ?? '',
          practiceDuration: options.practiceDuration ?? 'ask',
          cefrLevel: options.cefrLevel,
          tutorId: options.tutorId,
          spanishSupport: options.spanishSupport,
          isReconnect,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as {
          type?: string;
          data?: string;
          text?: string;
          expression?: AvatarExpression;
          correction?: LiveCorrection;
          award?: PronunciationPointsAward;
          durationMinutes?: 5 | 10 | 15;
          message?: string;
          code?: string;
        };

        if (msg.type === 'ready') {
          this.reconnectAttempts = 0;
          if (this.outputCtx && this.outputCtx.state === 'suspended') {
            void this.outputCtx.resume();
          }
          this.lockMicForTutorTurn();
          this.callbacks.onConnectionChange('connected', 'Conectado en tiempo real');
          this.setAvatarState('THINKING');
          return;
        }

        if (
          msg.type === 'sessionDuration' &&
          typeof msg.durationMinutes === 'number' &&
          msg.durationMinutes > 0
        ) {
          this.callbacks.onSessionDurationChange?.(msg.durationMinutes);
          return;
        }

        if (
          msg.type === 'timeGoalReached' &&
          typeof msg.durationMinutes === 'number' &&
          msg.durationMinutes > 0
        ) {
          this.callbacks.onTimeGoalReached?.(msg.durationMinutes);
          return;
        }

        if (msg.type === 'audio' && typeof msg.data === 'string') {
          this.awaitingTutorAfterSpeech = false;
          this.clearSilenceNudgeTimer();
          this.lockMicForTutorTurn();
          this.enqueueTutorAudio(msg.data);
          return;
        }

        if (msg.type === 'interrupted') {
          this.flushTutorPlayback();
          this.commitPendingTutorTurn();
          this.clearSilenceNudgeTimer();
          this.consecutiveSilenceNudges = 0;
          this.tutorGenerating = false;
          this.scheduleMicUnlockIfIdle(180);
          return;
        }

        if (msg.type === 'inputTranscript' && typeof msg.text === 'string') {
          this.commitPendingTutorTurn();
          if (msg.text.trim().length > 0) {
            this.consecutiveSilenceNudges = 0;
            this.clearSilenceNudgeTimer();
          }
          this.activeStudentChunk += msg.text;
          return;
        }

        if (msg.type === 'outputTranscript' && typeof msg.text === 'string') {
          this.commitPendingStudentTurn();
          if (this.resetCaptionOnNextTutorText) {
            this.activeTutorCaption = '';
            this.resetCaptionOnNextTutorText = false;
          }
          this.activeTutorChunk += msg.text;
          this.activeTutorCaption += msg.text;
          const cleanCaption = this.activeTutorCaption.replace(/\s+/g, ' ').trim();
          if (cleanCaption) {
            this.callbacks.onTutorCaptionChange?.(cleanCaption);
          }
          if (msg.expression) {
            this.callbacks.onExpressionChange(msg.expression);
          }
          return;
        }

        if (msg.type === 'correction' && msg.correction) {
          this.liveCorrections.push(msg.correction);
          this.callbacks.onCorrection?.(msg.correction);
          return;
        }

        if (msg.type === 'pointsAward' && msg.award) {
          this.totalPronunciationPoints += msg.award.points;
          this.playPointsChime();
          this.callbacks.onExpressionChange('congratulation');
          this.callbacks.onPointsAward?.(msg.award);
          return;
        }

        if (msg.type === 'safetyNotice' && typeof msg.message === 'string') {
          this.callbacks.onSafetyNotice?.(msg.message);
          return;
        }

        if (msg.type === 'turnComplete') {
          this.commitPendingStudentTurn();
          this.commitPendingTutorTurn();
          this.resetCaptionOnNextTutorText = true;
          this.hasCompletedTutorTurn = true;
          this.tutorGenerating = false;
          this.scheduleMicUnlockIfIdle(420);
          return;
        }

        if (msg.type === 'error') {
          const errMsg = msg.message || 'Ocurrió un error en la llamada de voz.';
          this.intentionalClose = true;
          this.callbacks.onConnectionChange('error', errMsg);
          this.callbacks.onError(errMsg);
          this.releaseAllResources();
        }
      } catch {
        // Ignore malformed frame
      }
    };

    ws.onclose = () => {
      if (this.intentionalClose) return;
      this.flushTutorPlayback();

      if (this.reconnectAttempts < 3 && this.lastOptions) {
        this.reconnectAttempts += 1;
        const delayMs = 900 * Math.pow(2, this.reconnectAttempts - 1);
        this.callbacks.onConnectionChange(
          'reconnecting',
          `Reconectando (intento ${this.reconnectAttempts}/3)...`
        );
        this.reconnectTimer = window.setTimeout(() => {
          if (!this.intentionalClose && this.lastOptions) {
            this.openWebSocket(this.lastOptions, true);
          }
        }, delayMs);
      } else {
        const msg = 'Se perdió la conexión de voz con el servidor. Puedes intentar reconectar.';
        this.callbacks.onConnectionChange('error', msg);
        this.callbacks.onError(msg);
      }
    };

    ws.onerror = () => {
      // Handled gracefully by onclose reconnect flow
    };
  }

  private enqueueTutorAudio(base64Pcm: string): void {
    if (!this.outputCtx || !this.outputGain) return;
    if (this.outputCtx.state === 'suspended') {
      void this.outputCtx.resume();
    }

    const floatSamples = decodeBase64Pcm16ToFloat32(base64Pcm);
    if (floatSamples.length === 0) return;

    const buffer = this.outputCtx.createBuffer(1, floatSamples.length, 24000);
    buffer.getChannelData(0).set(floatSamples);

    const source = this.outputCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputGain);

    const now = this.outputCtx.currentTime;
    // Slight 45ms lead buffer prevents micro-jitter clicks or voice pitch warps between PCM chunks
    const startAt = Math.max(now + 0.045, this.nextPlayTime);
    this.nextPlayTime = startAt + buffer.duration;

    this.activeSources.add(source);
    this.setAvatarState('SPEAKING');

    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0 && !this.intentionalClose) {
        if (this.tutorGenerating) {
          // Still receiving chunks for this tutor turn; keep mic locked cleanly
          return;
        }
        this.scheduleMicUnlockIfIdle(420);
      }
    };

    source.start(startAt);
  }

  private flushTutorPlayback(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Already stopped
      }
    }
    this.activeSources.clear();
    if (this.outputCtx) {
      this.nextPlayTime = this.outputCtx.currentTime;
    } else {
      this.nextPlayTime = 0;
    }
  }

  private commitPendingStudentTurn(): void {
    const cleaned = this.activeStudentChunk.trim();
    if (cleaned.length > 0) {
      this.transcriptTurns.push({
        speaker: 'student',
        text: cleaned,
        timestampMs: Date.now(),
      });
    }
    this.activeStudentChunk = '';
  }

  private commitPendingTutorTurn(): void {
    const cleaned = this.activeTutorChunk.trim();
    if (cleaned.length > 0) {
      this.transcriptTurns.push({
        speaker: 'tutor',
        text: cleaned,
        timestampMs: Date.now(),
      });
    }
    this.activeTutorChunk = '';
  }

  private setAvatarState(next: AvatarState): void {
    if (this.avatarState !== next) {
      this.avatarState = next;
      this.callbacks.onAvatarStateChange(next);
    }
  }

  private setMicLocked(locked: boolean): void {
    if (this.micLocked !== locked) {
      this.micLocked = locked;
      this.callbacks.onMicLockChange?.(locked);
    }
  }

  private clearMicUnlockTimer(): void {
    if (this.micUnlockTimer !== null) {
      window.clearTimeout(this.micUnlockTimer);
      this.micUnlockTimer = null;
    }
  }

  private lockMicForTutorTurn(): void {
    this.clearMicUnlockTimer();
    this.tutorGenerating = true;
    this.userSpeaking = false;
    this.latestMicLevel = 0;
    this.setMicLocked(true);
  }

  private scheduleMicUnlockIfIdle(tailMs = 420): void {
    if (this.intentionalClose || this.tutorGenerating || this.activeSources.size > 0) {
      return;
    }
    this.clearMicUnlockTimer();
    this.micUnlockTimer = window.setTimeout(() => {
      this.micUnlockTimer = null;
      if (this.intentionalClose || this.tutorGenerating || this.activeSources.size > 0) {
        return;
      }
      this.setMicLocked(false);
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'playbackDone' }));
        } catch {
          // ignore
        }
      }
      if (this.awaitingTutorAfterSpeech) {
        this.setAvatarState('THINKING');
      } else {
        this.setAvatarState('IDLE');
        if (this.hasCompletedTutorTurn) {
          this.scheduleSilenceNudge();
        }
      }
    }, tailMs);
  }

  private clearSilenceNudgeTimer(): void {
    if (this.silenceNudgeTimer !== null) {
      window.clearTimeout(this.silenceNudgeTimer);
      this.silenceNudgeTimer = null;
    }
  }

  private scheduleSilenceNudge(): void {
    this.clearSilenceNudgeTimer();
    if (
      this.intentionalClose ||
      this.muted ||
      this.micLocked ||
      this.tutorGenerating ||
      this.userSpeaking ||
      this.awaitingTutorAfterSpeech ||
      this.activeSources.size > 0 ||
      this.consecutiveSilenceNudges >= 2 ||
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const delayMs = this.consecutiveSilenceNudges === 0 ? 8500 : 11500;
    this.silenceNudgeTimer = window.setTimeout(() => {
      this.silenceNudgeTimer = null;
      if (
        this.intentionalClose ||
        this.muted ||
        this.micLocked ||
        this.tutorGenerating ||
        this.userSpeaking ||
        this.awaitingTutorAfterSpeech ||
        this.activeSources.size > 0 ||
        !this.ws ||
        this.ws.readyState !== WebSocket.OPEN
      ) {
        return;
      }
      this.consecutiveSilenceNudges += 1;
      this.awaitingTutorAfterSpeech = true;
      this.lockMicForTutorTurn();
      this.setAvatarState('THINKING');
      this.ws.send(
        JSON.stringify({
          type: 'silenceNudge',
          attempt: this.consecutiveSilenceNudges,
        })
      );
    }, delayMs);
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.mediaStream) {
      for (const track of this.mediaStream.getAudioTracks()) {
        track.enabled = !muted;
      }
    }
    if (muted) {
      this.clearSilenceNudgeTimer();
      if (this.userSpeaking) {
        this.userSpeaking = false;
        if (this.activeSources.size === 0) {
          this.setAvatarState('IDLE');
        }
      }
    } else if (this.hasCompletedTutorTurn && this.activeSources.size === 0 && !this.userSpeaking) {
      this.scheduleSilenceNudge();
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.outputGain && this.outputCtx) {
      this.outputGain.gain.setTargetAtTime(this.volume, this.outputCtx.currentTime, 0.02);
    }
  }

  public sampleTelemetry(): LiveVoiceTelemetry {
    let visemes: VisemeWeights = { jawOpen: 0, mouthSpread: 0, lipPucker: 0, energy: 0 };
    let lipOpen = 0;
    let tutorLevel = 0;

    if (this.outputAnalyser && this.outputCtx && this.activeSources.size > 0) {
      this.outputAnalyser.getByteFrequencyData(this.outputFreqBins);
      this.outputAnalyser.getByteTimeDomainData(this.outputTimeDomain);

      // Instantaneous time-domain RMS for zero-lag syllable envelope tracking
      let sumSq = 0;
      for (let i = 0; i < this.outputTimeDomain.length; i++) {
        const centered = (this.outputTimeDomain[i] - 128) / 128;
        sumSq += centered * centered;
      }
      const timeRms = Math.sqrt(sumSq / this.outputTimeDomain.length);

      visemes = extractVisemeWeights(
        this.outputFreqBins,
        this.outputCtx.sampleRate,
        this.outputAnalyser.fftSize
      );
      lipOpen = computeSyllableLipOpen(timeRms, visemes);
      tutorLevel = Math.max(visemes.energy, Math.min(1, timeRms * 3.8));
    } else {
      this.outputFreqBins.fill(0);
    }

    if (this.inputAnalyser && !this.muted) {
      this.inputAnalyser.getByteFrequencyData(this.inputFreqBins);
    } else {
      this.inputFreqBins.fill(0);
    }

    const activeBins =
      this.activeSources.size > 0 ? this.outputFreqBins : this.inputFreqBins;

    return {
      visemes,
      lipOpen,
      micLevel: this.muted ? 0 : this.latestMicLevel,
      tutorLevel,
      waveformBins: activeBins,
    };
  }

  public getTranscript(): TranscriptTurn[] {
    this.commitPendingStudentTurn();
    this.commitPendingTutorTurn();
    return [...this.transcriptTurns];
  }

  public getCorrections(): LiveCorrection[] {
    return [...this.liveCorrections];
  }

  public getPronunciationPoints(): number {
    return this.totalPronunciationPoints;
  }

  private playPointsChime(): void {
    if (!this.outputCtx || this.volume <= 0.01) return;
    try {
      const ctx = this.outputCtx;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const now = ctx.currentTime + 0.01;
      const notes = [523.25, 659.25, 783.99]; // Warm C5 -> E5 -> G5 reward chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.075);
        const peak = Math.min(0.11, 0.1 * this.volume);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.075);
        gain.gain.exponentialRampToValueAtTime(peak, now + idx * 0.075 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.075 + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.075);
        osc.stop(now + idx * 0.075 + 0.28);
      });
    } catch {
      // Ignore audio chime failure gracefully
    }
  }

  public extendSession(extraMinutes = 5): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'extendDuration', extraMinutes }));
      } catch {
        // ignore if socket is closing
      }
    }
  }

  public stop(): TranscriptTurn[] {
    this.intentionalClose = true;
    const finalTranscript = this.getTranscript();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'end' }));
      } catch {
        // ignore
      }
    }
    this.releaseAllResources();
    this.setAvatarState('IDLE');
    this.callbacks.onConnectionChange('ended', 'Llamada finalizada');
    return finalTranscript;
  }

  private releaseAllResources(): void {
    this.clearSilenceNudgeTimer();
    this.clearMicUnlockTimer();
    this.tutorGenerating = false;
    this.setMicLocked(false);
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.flushTutorPlayback();

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    if (this.workletNode) {
      try {
        this.workletNode.disconnect();
      } catch {
        // ignore
      }
      this.workletNode = null;
    }

    if (this.scriptNode) {
      try {
        this.scriptNode.disconnect();
      } catch {
        // ignore
      }
      this.scriptNode = null;
    }

    if (this.workletBlobUrl) {
      URL.revokeObjectURL(this.workletBlobUrl);
      this.workletBlobUrl = null;
    }

    // Guarantee microphone tracks are stopped and OS indicator turns off immediately
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }

    if (this.inputCtx) {
      void this.inputCtx.close().catch(() => undefined);
      this.inputCtx = null;
    }

    if (this.outputCtx) {
      void this.outputCtx.close().catch(() => undefined);
      this.outputCtx = null;
    }

    this.outputGain = null;
    this.outputAnalyser = null;
    this.inputAnalyser = null;
    this.latestMicLevel = 0;
  }
}
