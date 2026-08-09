import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Loader2, AlertCircle
} from 'lucide-react';

const formatTime = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function VideoPlayer({ hlsUrl, seekTo, onTimeUpdate }) {
  const videoRef      = useRef(null);
  const hlsRef        = useRef(null);
  const containerRef  = useRef(null);
  const progressRef   = useRef(null);

  const [playing,    setPlaying]    = useState(false);
  const [muted,      setMuted]      = useState(false);
  const [volume,     setVolume]     = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,   setDuration]   = useState(0);
  const [buffered,   setBuffered]   = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef(null);

  // ── Load HLS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;
    setLoading(true);
    setError('');

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.setRequestHeader('Cache-Control', 'no-cache');
        }
      });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setLoading(false));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError('Failed to load video stream.');
        setLoading(false);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      videoRef.current.src = hlsUrl;
      videoRef.current.addEventListener('loadedmetadata', () => setLoading(false));
    } else {
      setError('HLS is not supported in this browser.');
      setLoading(false);
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [hlsUrl]);

  // ── External seek (from comment click) ──────────────────────────────────
  useEffect(() => {
    if (seekTo !== null && seekTo !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTo;
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [seekTo]);

  // ── Video event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay      = () => setPlaying(true);
    const onPause     = () => setPlaying(false);
    const onDuration  = () => setDuration(video.duration);
    const onTimeupd   = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
      // Update buffered
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onFullscCh  = () => setFullscreen(!!document.fullscreenElement);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('timeupdate', onTimeupd);
    document.addEventListener('fullscreenchange', onFullscCh);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('timeupdate', onTimeupd);
      document.removeEventListener('fullscreenchange', onFullscCh);
    };
  }, [onTimeUpdate]);

  // ── Controls auto-hide ────────────────────────────────────────────────────
  const revealControls = () => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play().catch(() => {});
  }, [playing]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    setMuted(val === 0);
  };

  const handleSeek = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = ratio * duration;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const progressPct   = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct   = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      style={{
        position: 'relative', width: '100%',
        aspectRatio: '16/9', background: '#000',
        borderRadius: fullscreen ? 0 : 16,
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(99,102,241,0.15)',
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        playsInline
        onClick={togglePlay}
      />

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
        }}>
          <Loader2 size={40} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          background: 'rgba(0,0,0,0.85)',
        }}>
          <AlertCircle size={36} color="#f87171" />
          <p style={{ color: '#f87171', fontSize: 14 }}>{error}</p>
        </div>
      )}

      {/* Controls Bar */}
      <div className="video-player-controls" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '32px 16px 12px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        transition: 'opacity 0.3s ease',
        opacity: showControls ? 1 : 0,
      }}>
        {/* Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="video-progress-bar"
          style={{
            height: 6, background: 'rgba(255,255,255,0.15)',
            borderRadius: 4, cursor: 'pointer', marginBottom: 12,
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Buffered */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${bufferedPct}%`,
            background: 'rgba(255,255,255,0.2)', transition: 'width 0.3s',
          }} />
          {/* Played */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg,var(--accent-blue),var(--accent-purple))',
            borderRadius: 4, transition: 'width 0.1s',
          }} />
          {/* Thumb */}
          <div className="video-progress-thumb" style={{
            position: 'absolute', top: '50%', left: `${progressPct}%`,
            transform: 'translate(-50%,-50%)',
            width: 14, height: 14, borderRadius: '50%',
            background: '#fff', boxShadow: '0 0 8px rgba(99,102,241,0.8)',
            transition: 'left 0.1s',
          }} />
        </div>

        {/* Controls Row */}
        <div className="video-controls-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Play/Pause */}
          <button onClick={togglePlay} className="video-control-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: 8, minWidth: 44, minHeight: 44 }}>
            {playing ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Volume */}
          <button onClick={toggleMute} className="video-control-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: 8, minWidth: 44, minHeight: 44 }}>
            {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="video-volume-slider"
            style={{ width: 80, accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
          />

          {/* Time */}
          <span className="video-time-display" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontVariantNumeric: 'tabular-nums', marginLeft: 4 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div style={{ flex: 1 }} />

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="video-control-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: 8, minWidth: 44, minHeight: 44 }}>
            {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
