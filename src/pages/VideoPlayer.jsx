import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";
import "videojs-mobile-ui";
import "videojs-seek-buttons";
import "videojs-responsive-controls"; // Import videojs responsive controls
import "videojs-mobile-ui/dist/videojs-mobile-ui.css";
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
  const isLive = location.pathname.includes("/video/live");
  const defaultLiveUrl = "m3u8_link_here";
  const telegramDownloaderLink = "https://t.me/your_downloader_group"; // Replace with actual link

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
      playerRef.current.dispose();
    }

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      fluid: true,
      preload: "auto",
      playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
        },
      },
    }, function () {
      this.seekButtons({
        forward: 10,
        back: 10,
      });

      this.mobileUi({
        touchControls: {
          tap: {
            togglePlay: true,
          },
        },
      });
    });

    playerRef.current.src({
      src: videoSource,
      type: "application/x-mpegURL",
    });

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

    playerRef.current.ready(() => {
      playerRef.current.qualityLevels();
      playerRef.current.hlsQualitySelector({
        displayCurrentQuality: true,
      });

      const controlBar = playerRef.current.controlBar;
      const playToggleEl = controlBar.getChild("playToggle")?.el();
      if (playToggleEl) {
        const timeDisplay = document.createElement("div");
        timeDisplay.className = "vjs-custom-time-display";
        timeDisplay.style.position = "absolute";
        timeDisplay.style.bottom = "50px";
        timeDisplay.style.left = "0";
        timeDisplay.style.background = "rgba(0, 0, 0, 0.7)";
        timeDisplay.style.color = "#fff";
        timeDisplay.style.fontSize = "13px";
        timeDisplay.style.padding = "4px 8px";
        timeDisplay.style.borderRadius = "4px";
        timeDisplay.style.whiteSpace = "nowrap";
        timeDisplay.style.pointerEvents = "none";
        timeDisplay.style.zIndex = "999";
        timeDisplay.textContent = "00:00 / 00:00";

        playToggleEl.style.position = "relative";
        playToggleEl.appendChild(timeDisplay);

        playerRef.current.on("loadedmetadata", () => {
          const duration = formatTime(playerRef.current.duration());
          timeDisplay.textContent = `00:00 / ${duration}`;
        });

        playerRef.current.on("timeupdate", () => {
          const currentTime = formatTime(playerRef.current.currentTime());
          const duration = formatTime(playerRef.current.duration());
          timeDisplay.textContent = `${currentTime} / ${duration}`;
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
    });

    const videoContainer = videoRef.current.parentElement;
    const videoEl = videoRef.current;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let lastTap = 0;
    let holdTimeout = null;
    let speedHeld = false;

    // --- Hold to Speed Up ---
    const handleTouchStart = () => {
      if (!isMobile) return;
      holdTimeout = setTimeout(() => {
        if (playerRef.current && !speedHeld) {
          speedHeld = true;
          playerRef.current.playbackRate(2);
        }
      }, 1000); // Start speeding up after 1 second hold
    };

    const handleTouchEnd = () => {
      if (!isMobile) return;
      clearTimeout(holdTimeout);
      if (playerRef.current && speedHeld) {
        playerRef.current.playbackRate(1);
        speedHeld = false;
      }
    };

    // --- Double Tap Gesture ---
    videoContainer.addEventListener("touchend", (event) => {
      const currentTime = Date.now();
      const tapGap = currentTime - lastTap.current;
      lastTap.current = currentTime;

      const touch = event.changedTouches[0];
      const rect = videoContainer.getBoundingClientRect();
      const tapX = touch.clientX - rect.left;
      const videoWidth = rect.width;

      if (tapGap < 300) {
        if (tapX < videoWidth / 3) {
          playerRef.current.currentTime(playerRef.current.currentTime() - 10);
        } else if (tapX > (2 * videoWidth) / 3) {
          playerRef.current.currentTime(playerRef.current.currentTime() + 10);
        } else {
          playerRef.current.paused()
            ? playerRef.current.play()
            : playerRef.current.pause();
        }
      }
    });

    // Add listeners
    videoEl.addEventListener("touchstart", handleTouchStart);
    videoEl.addEventListener("touchend", handleTouchEnd);

    // Cleanup
    return () => {
      videoEl.removeEventListener("touchstart", handleTouchStart);
      videoEl.removeEventListener("touchend", handleTouchEnd);
    };

  }, [isLive, m3u8Url]);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleGoToDownloadClick = () => {
    const fileName = `${chaptersName} ${lecturesName}`; // You can customize filename if you want
    const downloadUrl = m3u8Url;
    const intentUrl = `intent:${downloadUrl}#Intent;action=android.intent.action.VIEW;package=idm.internet.download.manager;scheme=1dmdownload;S.title=${encodeURIComponent(fileName)};end`;

    // Redirect to open in 1DM
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
        <video ref={videoRef} className="video-js vjs-fluid vjs-default-skin" controls>
          <source src={m3u8Url} type="application/x-mpegURL" />
        </video>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>Click here to start your download!</p>
            <button onClick={handleGoToDownloadClick}>Go to Download</button>
          </div>
        </div>
      )}

      <div className="notes-section">
        <h3>Notes</h3>
        <a href={notesUrl} target="_blank" rel="noopener noreferrer">
          Click to open notes
        </a>
      </div>

      <div className="study-time">
        <p>Total study time today: {studiedMinutes} minutes</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
