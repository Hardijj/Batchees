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

  const { chapterName, lectureName, m3u8Url, notesUrl } = location.state || {};
  const isLive = location.pathname.includes("/live");
  const telegramDownloaderLink = "https://t.me/+UHFOhCOAU7xhYWY9";

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
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
    if (!videoRef.current) return;
    const video = videoRef.current;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let hls;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(m3u8Url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setupPlyr();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = m3u8Url;
        setupPlyr();
      }
    };

    const setupPlyr = () => {
  if (!hls || !playerRef.current) return;

  // Extract available quality options from HLS
  const availableQualities = hls.levels.map((level) => level.height).sort((a, b) => b - a);

  playerRef.current = new Plyr(video, {
    settings: ["quality", "speed", "loop"],
    quality: {
      default: availableQualities[0],
      options: availableQualities,
      forced: true,
      onChange: (newQuality) => {
        const levelIndex = hls.levels.findIndex((l) => l.height === newQuality);
        hls.currentLevel = levelIndex;
      },
    },
    autoplay: false,
    fluid: true,
    playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
  });

  bindCustomGestures();
};

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

    const handlePlay = () => {
      sessionStart = Date.now();
      clearInterval(studyTimer);
      studyTimer = setInterval(updateStudyTime, 10000);
    };

    const handlePause = () => {
      updateStudyTime();
      clearInterval(studyTimer);
    };

    const handleEnded = () => {
      updateStudyTime();
      clearInterval(studyTimer);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    const bindCustomGestures = () => {
      const videoContainer = video.parentElement;

      let holdTimeout = null;
      let speedHeld = false;

      const handleTouchStart = () => {
        if (!isMobile) return;
        holdTimeout = setTimeout(() => {
          if (playerRef.current && !speedHeld) {
            speedHeld = true;
            playerRef.current.speed = 2;
          }
        }, 1000);
      };

      const handleTouchEnd = () => {
        if (!isMobile) return;
        clearTimeout(holdTimeout);
        if (playerRef.current && speedHeld) {
          playerRef.current.speed = 1;
          speedHeld = false;
        }
      };

      const handleDoubleTap = (event) => {
        const currentTime = Date.now();
        const tapGap = currentTime - lastTap.current;
        lastTap.current = currentTime;

        const touch = event.changedTouches[0];
        const rect = videoContainer.getBoundingClientRect();
        const tapX = touch.clientX - rect.left;
        const width = rect.width;

        if (tapGap < 300) {
          if (tapX < width / 3) {
            playerRef.current.currentTime -= 10;
          } else if (tapX > (2 * width) / 3) {
            playerRef.current.currentTime += 10;
          } else {
            playerRef.current.togglePlay();
          }
        }
      };

      video.addEventListener("touchstart", handleTouchStart);
      video.addEventListener("touchend", handleTouchEnd);
      videoContainer.addEventListener("touchend", handleDoubleTap);
    };

    initPlayer();

    return () => {
      if (hls) hls.destroy();
      if (playerRef.current) playerRef.current.destroy();
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      clearInterval(studyTimer);
    };
  }, [m3u8Url, isLive]);

  const handleDownloadClick = () => {
    const fileName = `${chaptersName} ${lecturesName}`;
    const intentUrl = `intent:${m3u8Url}#Intent;action=android.intent.action.VIEW;package=idm.internet.download.manager;scheme=1dmdownload;S.title=${encodeURIComponent(fileName)};end`;
    window.location.href = intentUrl;
  };

  return (
    <div>
      <h2>
        {isLive
          ? "🔴 Live Class"
          : `Now Playing: ${chaptersName} - ${lecturesName || "Unknown Lecture"}`}
      </h2>

      <div style={{ position: "relative" }}>
        <video ref={videoRef} className="plyr-react plyr" />
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
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            zIndex: 1000,
            textAlign: "center",
            maxWidth: "90%",
          }}
        >
          <p style={{ marginBottom: "15px", color: "#333" }}>
            Link copied to clipboard. Go to Telegram group, paste the link, and send to download the video.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ddd",
                border: "none",
                borderRadius: "5px",
                color: "#333",
                fontWeight: "bold",
                flex: 1,
                marginRight: "10px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => window.open(telegramDownloaderLink, "_blank")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                border: "none",
                borderRadius: "5px",
                color: "#fff",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              Go to Downloader
            </button>
          </div>
        </div>
      )}

      {notesUrl && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <a
            href={notesUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "5px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "16px",
              display: "inline-block",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            Download Notes
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
