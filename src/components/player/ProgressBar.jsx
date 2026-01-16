import { useRef, useState } from 'react';

export default function ProgressBar({ progress, onSeek }) {
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(null);

  const calculateProgress = (e) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return percent;
  };

  const handleClick = (e) => {
    const percent = calculateProgress(e);
    onSeek(percent);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const percent = calculateProgress(e);
    onSeek(percent);

    const handleMouseMove = (e) => {
      const percent = calculateProgress(e);
      onSeek(percent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const percent = calculateProgress(e);
    setHoverProgress(percent * 100);
  };

  const handleMouseLeave = () => {
    setHoverProgress(null);
  };

  return (
    <div
      ref={barRef}
      className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group relative"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background track */}
      <div className="absolute inset-0 rounded-full bg-gray-600" />

      {/* Progress fill */}
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-colors ${
          isDragging ? 'bg-green-500' : 'bg-white group-hover:bg-green-500'
        }`}
        style={{ width: `${progress}%` }}
      />

      {/* Hover indicator */}
      {hoverProgress !== null && (
        <div
          className="absolute top-0 h-full bg-white/20 rounded-full"
          style={{ width: `${hoverProgress}%` }}
        />
      )}

      {/* Thumb */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow transition-opacity ${
          isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{ left: `calc(${progress}% - 6px)` }}
      />
    </div>
  );
}
