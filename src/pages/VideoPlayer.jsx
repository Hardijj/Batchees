import React, { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";
import { useLocation, useNavigate } from "react-router-dom";

const VideoPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastTap = useRef(0);
  const [studiedMinutes, setStudiedMinutes] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const chaptersName = localStorage.getItem("chapterName");
  const lecturesName = localStorage.getItem("lectureName");
  const { chapterName, lectureName, m3u8Url } = location.state || {};
  const isLive = location.pathname.includes("/live");

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem("lastStudyDate");

    if (lastDate !== today) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("studyTime_")) localStorage.removeItem(key);
      });
      localStorage.setItem("lastStudyDate", today);
    }

    const stored = parseFloat(localStorage.getItem(`studyTime_${today}`)) || 0;
    setStudiedMinutes(Math.floor(stored / 60));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls, sessionStart = null, studyTimer = null;

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

    if (Hls.isSupported()) {
  hls = new Hls();
  hls.loadSource(m3u8Url);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
    const availableQualities = data.levels.map((l) => l.height).sort((a, b) => b - a);
    playerRef.current?.quality?.update({ options: availableQualities });

    // Set default quality (you can change this)
    hls.currentLevel = availableQualities.indexOf(720);

    // Optional: Listen for user quality changes
    playerRef.current.on("qualitychange", (event) => {
      const quality = event.detail.plyr.quality;
      const levelIndex = data.levels.findIndex((l) => l.height === quality);
      if (levelIndex !== -1) {
        hls.currentLevel = levelIndex;
      }
    });
  });

  playerRef.current = new Plyr(video, {
    quality: {
      default: 720,
      options: [],
      forced: true,
      onChange: () => {},
    },
    controls: [
      "play-large", "play", "rewind", "fast-forward", "progress", "current-time",
      "duration", "mute", "volume", "captions", "settings", "fullscreen"
    ],
  });
      }

    playerRef.current.on("play", () => {
      sessionStart = Date.now();
      clearInterval(studyTimer);
      studyTimer = setInterval(updateStudyTime, 10000);
    });

    playerRef.current.on("pause", () => {
      updateStudyTime();
      clearInterval(studyTimer);
    });

    playerRef.current.on("ended", () => {
      updateStudyTime();
      clearInterval(studyTimer);
    });

    const handleDoubleTap = (e) => {
      const current = Date.now();
      const delta = current - lastTap.current;
      lastTap.current = current;

      const rect = video.getBoundingClientRect();
      const x = e.changedTouches[0].clientX - rect.left;
      const width = rect.width;

      if (delta < 300) {
        if (x < width / 3) video.currentTime -= 10;
        else if (x > (2 * width) / 3) video.currentTime += 10;
        else video.paused ? video.play() : video.pause();
      }
    };

    const handleTouchStart = () => {
      holdTimeout = setTimeout(() => {
        playerRef.current.speed = 2;
      }, 1000);
    };

    const handleTouchEnd = () => {
      clearTimeout(holdTimeout);
      playerRef.current.speed = 1;
    };

    let holdTimeout = null;
    video.addEventListener("touchend", handleDoubleTap);
    video.addEventListener("touchstart", handleTouchStart);
    video.addEventListener("touchend", handleTouchEnd);

    return () => {
      playerRef.current?.destroy();
      hls?.destroy();
      clearInterval(studyTimer);
      video.removeEventListener("touchend", handleDoubleTap);
      video.removeEventListener("touchstart", handleTouchStart);
      video.removeEventListener("touchend", handleTouchEnd);
    };
  }, [m3u8Url]);

  const handleDownloadClick = () => {
    const fileName = `${chaptersName} ${lecturesName}`;
    const downloadUrl = m3u8Url;
    const intentUrl = `intent:${downloadUrl}#Intent;action=android.intent.action.VIEW;package=idm.internet.download.manager;scheme=1dmdownload;S.title=${encodeURIComponent(fileName)};end`;
    window.location.href = intentUrl;
  };

  return (
    <div>
      <h2>
        {isLive
          ? "🔴 Live Class"
          : `Now Playing: ${chaptersName} - ${lecturesName || "Unknown Lecture"}`}
      </h2>

      <div className="video-container" style={{ position: "relative" }}>
        <video ref={videoRef} className="plyr-react plyr" playsInline controls />
      </div>

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

      {showPopup && (
        <div style={{
          position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
          backgroundColor: "#fff", padding: "20px", borderRadius: "10px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)", zIndex: 1000, textAlign: "center"
        }}>
          <p style={{ marginBottom: "15px", color: "#333" }}>
            Link copied. Paste it in the Telegram group to download the video.
          </p>
          <button
            onClick={() => setShowPopup(false)}
            style={{
              padding: "8px 16px", backgroundColor: "#ddd", border: "none",
              borderRadius: "5px", color: "#333", fontWeight: "bold"
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
