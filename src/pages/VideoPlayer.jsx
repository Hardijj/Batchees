import React, { useEffect, useRef, useState } from "react"; import Plyr from "plyr"; import "plyr/dist/plyr.css"; import { useLocation, useNavigate } from "react-router-dom";

const VideoPlayer = () => { const location = useLocation(); const navigate = useNavigate(); const videoRef = useRef(null); const lastTap = useRef(0); const [studiedMinutes, setStudiedMinutes] = useState(0); const [showPopup, setShowPopup] = useState(false); const chaptersName = localStorage.getItem("chapterName"); const lecturesName = localStorage.getItem("lectureName");

const { chapterName, lectureName, m3u8Url, notesUrl } = location.state || {}; const isLive = location.pathname.includes("/live");

useEffect(() => { const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; if (!isLoggedIn) navigate("/login"); }, [navigate]);

useEffect(() => { const today = new Date().toLocaleDateString(); const lastDate = localStorage.getItem("lastStudyDate"); if (lastDate !== today) { Object.keys(localStorage).forEach((key) => { if (key.startsWith("studyTime_")) localStorage.removeItem(key); }); localStorage.setItem("lastStudyDate", today); } const stored = parseFloat(localStorage.getItem(studyTime_${today})) || 0; setStudiedMinutes(Math.floor(stored / 60)); }, []);

useEffect(() => { if (!videoRef.current) return;

const player = new Plyr(videoRef.current, {
  controls: [
    "play",
    "progress",
    "current-time",
    "mute",
    "volume",
    "captions",
    "settings",
    "fullscreen"
  ],
  settings: ["quality", "speed"],
  speed: { selected: 1, options: [0.5, 1, 1.25, 1.5, 1.75, 2] },
});

videoRef.current.src = m3u8Url;

let sessionStart = null;
let studyTimer = null;

const updateStudyTime = () => {
  const now = Date.now();
  const elapsed = sessionStart ? (now - sessionStart) / 1000 : 0;
  sessionStart = now;
  const today = new Date().toLocaleDateString();
  const key = `studyTime_${today}`;
  const existing = parseFloat(localStorage.getItem(key)) || 0;
  const newTotal = existing + elapsed;
  localStorage.setItem(key, newTotal.toString());
  setStudiedMinutes(Math.floor(newTotal / 60));
};

player.on("play", () => {
  sessionStart = Date.now();
  clearInterval(studyTimer);
  studyTimer = setInterval(updateStudyTime, 10000);
});

player.on("pause", () => {
  updateStudyTime();
  clearInterval(studyTimer);
});

player.on("ended", () => {
  updateStudyTime();
  clearInterval(studyTimer);
});

const container = videoRef.current.parentElement;
let holdTimeout = null;
let speedHeld = false;

const handleTouchStart = () => {
  holdTimeout = setTimeout(() => {
    if (!speedHeld) {
      speedHeld = true;
      player.speed = 2;
    }
  }, 1000);
};

const handleTouchEnd = () => {
  clearTimeout(holdTimeout);
  if (speedHeld) {
    player.speed = 1;
    speedHeld = false;
  }
};

const handleDoubleTap = (event) => {
  const currentTime = Date.now();
  const tapGap = currentTime - lastTap.current;
  lastTap.current = currentTime;
  const touch = event.changedTouches[0];
  const rect = container.getBoundingClientRect();
  const tapX = touch.clientX - rect.left;
  const width = rect.width;
  if (tapGap < 300) {
    if (tapX < width / 3) {
      player.currentTime = Math.max(player.currentTime - 10, 0);
    } else if (tapX > (2 * width) / 3) {
      player.currentTime = Math.min(player.currentTime + 10, player.duration);
    } else {
      player.togglePlay();
    }
  }
};

videoRef.current.addEventListener("touchstart", handleTouchStart);
videoRef.current.addEventListener("touchend", handleTouchEnd);
container.addEventListener("touchend", handleDoubleTap);

return () => {
  player.destroy();
  clearInterval(studyTimer);
};

}, [m3u8Url]);

const handleDownloadClick = () => { const fileName = ${chaptersName} ${lecturesName}; const intentUrl = intent:${m3u8Url}#Intent;action=android.intent.action.VIEW;package=idm.internet.download.manager;scheme=1dmdownload;S.title=${encodeURIComponent(fileName)};end; window.location.href = intentUrl; };

return ( <div> <h2> {isLive ? "🔴 Live Class" : Now Playing: ${chaptersName} - ${lecturesName || "Unknown Lecture"}} </h2> <div style={{ position: "relative" }}> <video ref={videoRef} className="plyr__video-embed" controls></video> </div>

{!isLive && (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={handleDownloadClick}
        style={{
          backgroundColor: "#28a745",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        Download Lecture
      </button>
    </div>
  )}
</div>

); };

export default VideoPlayer;

