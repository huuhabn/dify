'use client';

import { useState, useEffect } from 'react';

interface AudioPlayerButtonProps {
  text: string;
}

export function AudioPlayerButton({ text }: AudioPlayerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      title={isPlaying ? 'Stop audio' : 'Listen with Text-to-Speech (TTS)'}
      className={`inline-flex items-center gap-1 cursor-pointer rounded-lg p-1 text-xs transition-colors ${
        isPlaying
          ? 'text-blue-600 bg-blue-50 font-semibold'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      }`}
    >
      {isPlaying ? (
        <>
          <span className="flex h-3 w-3 items-center justify-center">
            <span className="h-2 w-2 rounded-xs bg-blue-600" />
          </span>
          <span className="text-[11px] animate-pulse">Playing...</span>
        </>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )}
    </button>
  );
}
