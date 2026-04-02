import { useRef, useState } from 'react';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ProgressBar({ progress, duration, onSeek }) {
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPercent, setHoverPercent] = useState(null);

  const getPercent = (e) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    onSeek(getPercent(e));

    const onMove = (e) => onSeek(getPercent(e));
    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={barRef}
      className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group relative"
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => setHoverPercent(getPercent(e))}
      onMouseLeave={() => setHoverPercent(null)}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full bg-gray-600" />

      {/* Fill */}
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-colors ${
          isDragging ? 'bg-green-500' : 'bg-white group-hover:bg-green-500'
        }`}
        style={{ width: `${progress}%` }}
      />

      {/* Thumb */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow transition-opacity ${
          isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{ left: `calc(${progress}% - 6px)` }}
      />

      {/* Time tooltip */}
      {hoverPercent !== null && duration > 0 && (
        <div
          className="absolute -top-7 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 pointer-events-none -translate-x-1/2 shadow"
          style={{ left: `${hoverPercent * 100}%` }}
        >
          {formatTime(hoverPercent * duration)}
        </div>
      )}
    </div>
  );
}
