import React, { useEffect, useRef } from 'react';
import shaka from 'shaka-player';

const LectureList = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Initialize Shaka Player
    const player = new shaka.Player(videoRef.current);

    // Optional: Log errors
    player.addEventListener('error', (e) => {
      console.error('Shaka error:', e.detail);
    });

    // Load the DASH stream
    player.load(
      "https://sec-prod-mediacdn.pw.live/2ac4181c-f39d-42d6-9634-31768b77f308/master.mpd?URLPrefix=aHR0cHM6Ly9zZWMtcHJvZC1tZWRpYWNkbi5wdy5saXZlLzJhYzQxODFjLWYzOWQtNDJkNi05NjM0LTMxNzY4Yjc3ZjMwOA&Expires=1749291993&KeyName=pw-prod-key&Signature=3DbFLCAGniMP7gmYH8bu8pxlwXxhZeYpREpV8eSlIw6hZa1zUb1-Xm11Q14qCmcyyFGsX8U2XV9d5ivwidbgCw"
    ).then(() => {
      console.log('Video loaded!');
    }).catch((err) => {
      console.error('Error loading video:', err);
    });

    // Cleanup
    return () => player.destroy();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        width="100%"
        controls
        autoPlay
        style={{ backgroundColor: 'black' }}
      />
    </div>
  );
};

export default LectureList;
