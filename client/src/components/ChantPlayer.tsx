import React, { useState, useRef, useEffect } from 'react';
import './ChantPlayer.css';

export function ChantPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Real Krishna Bansuri flute melody - royalty-free spiritual audio
    const fluteUrls = [
      'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',  // Flute meditation
      'https://cdn.pixabay.com/download/audio/2021/11/13/audio_cb4f3d7aa5.mp3',  // Bansuri ambient
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',           // Fallback
    ];
    
    const audio = new Audio(fluteUrls[0]);
    audio.loop = true;
    audio.volume = 0.4;
    
    // Try fallback URLs if primary fails
    let urlIndex = 0;
    audio.onerror = () => {
      urlIndex++;
      if (urlIndex < fluteUrls.length) {
        audio.src = fluteUrls[urlIndex];
        audio.load();
      }
    };
    
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="chant-player" title="Divine Flute & Mantra Ambience">
      <button
        onClick={togglePlay}
        className={`chant-btn ${playing ? 'is-playing' : ''}`}
        aria-label={playing ? 'Mute divine flute' : 'Play divine flute melody'}
      >
        <span className="chant-waves">
          <span className="wave bar-1"></span>
          <span className="wave bar-2"></span>
          <span className="wave bar-3"></span>
        </span>
        <span className="chant-label">{playing ? 'Mantra Playing' : 'Play Flute'}</span>
      </button>
    </div>
  );
}

export default ChantPlayer;
