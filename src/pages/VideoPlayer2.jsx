import React, { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";  // Import Plyr CSS
import { useLocation, useNavigate } from "react-router-dom";

const VideoPlayer2 = () => {
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
  const isLive = location.pathname.includes("/video/live");
  const defaultLiveUrl = "m3u8_link_here";
  const telegramDownloaderLink = "https://t.me/your_downloader_group";

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

    const videoSource = isLive ? defaultLiveUrl : m3u8Url || defaultLiveUrl;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new Plyr(videoRef.current, {
      controls: [
        "play", "progress", "current-time", "mute", "volume", "fullscreen",
        "settings", "quality", "speed", "picture-in-picture"
      ],
      autoplay: false,
      mute: false,
      clickToPlay: true,
      sources: [{
        src: videoSource,
        type: "application/x-mpegURL",
      }],
      quality: {
        default: 720,
        options: [360, 480, 720, 1080], // Adjust this based on your stream
      },
      speed: {
        default: 1,
        options: [0.5, 1, 1.5, 2],
      },
      settings: ["quality", "speed"],
    });

    // Handle Plyr player events for study timer and time tracking
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

    // Handle double-tap to skip forward/backward
    const videoContainer = videoRef.current.parentElement;
    const videoEl = videoRef.current;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let holdTimeout = null;
    let speedHeld = false;

    const handleTouchStart = () => {
      if (!isMobile) return;
      holdTimeout = setTimeout(() => {
        if (playerRef.current && !speedHeld) {
          speedHeld = true;
          playerRef.current.playbackRate = 2;
        }
      }, 1000);
    };

    const handleTouchEnd = () => {
      if (!isMobile) return;
      clearTimeout(holdTimeout);
      if (playerRef.current && speedHeld) {
        playerRef.current.playbackRate = 1;
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
          playerRef.current.currentTime = playerRef.current.currentTime - 10;
        } else if (tapX > (2 * width) / 3) {
          playerRef.current.currentTime = playerRef.current.currentTime + 10;
        } else {
          playerRef.current.paused ? playerRef.current.play() : playerRef.current.pause();
        }
      }
    };

    videoEl.addEventListener("touchstart", handleTouchStart);
    videoEl.addEventListener("touchend", handleTouchEnd);
    videoContainer.addEventListener("touchend", handleDoubleTap);

    return () => {
      videoEl.removeEventListener("touchstart", handleTouchStart);
      videoEl.removeEventListener("touchend", handleTouchEnd);
      videoContainer.removeEventListener("touchend", handleDoubleTap);
      playerRef.current.destroy();
    };
  }, [m3u8Url, isLive]);

  const handleGoToDownloadClick = () => {
    const fileName = `${chaptersName} ${lecturesName}`;
    const downloadUrl = m3u8Url;
    const intentUrl = `intent:${downloadUrl}#Intent;action=android.intent.action.VIEW;package=idm.internet.download.manager;scheme=1dmdownload;S.title=${encodeURIComponent(
      fileName
    )};end`;

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
        <video ref={videoRef} className="plyr"></video>
      </div>

      {!isLive && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={handleGoToDownloadClick}
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
  );
};

export default VideoPlayer2;
