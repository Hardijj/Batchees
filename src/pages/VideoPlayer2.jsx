import React, { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import Hls from "hls.js";
import { useLocation, useNavigate } from "react-router-dom";

const VideoPlayer2 = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastTap = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [studiedMinutes, setStudiedMinutes] = useState(0);

  const { chapterName, lectureName, m3u8Url, notesUrl } = location.state || {};
  const chaptersName = localStorage.getItem("chapterName");
  const lecturesName = localStorage.getItem("lectureName");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
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

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(m3u8Url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        playerRef.current = new Plyr(video, {
          controls: [
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "captions",
            "settings",
            "fullscreen",
          ],
          settings: ["quality", "speed"],
          speed: { selected: 1, options: [0.5, 1, 1.25, 1.5, 2] },
        });
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = m3u8Url;
    }

    let sessionStart = Date.now();
    let studyTimer = setInterval(() => {
      const elapsed = (Date.now() - sessionStart) / 1000;
      const today = new Date().toLocaleDateString();
      const key = `studyTime_${today}`;
      const prev = parseFloat(localStorage.getItem(key)) || 0;
      const total = prev + elapsed;
      localStorage.setItem(key, total.toString());
      setStudiedMinutes(Math.floor(total / 60));
      sessionStart = Date.now();
    }, 10000);

    const handleTouchStart = (e) => {
      if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;
      e.target.holdTimeout = setTimeout(() => {
        if (playerRef.current) playerRef.current.speed = 2;
      }, 1000);
    };

    const handleTouchEnd = (e) => {
      clearTimeout(e.target.holdTimeout);
      if (playerRef.current) playerRef.current.speed = 1;
    };

    const handleDoubleTap = (e) => {
      const now = Date.now();
      const tapGap = now - lastTap.current;
      lastTap.current = now;

      const rect = video.getBoundingClientRect();
      const x = e.changedTouches[0].clientX - rect.left;
      const width = rect.width;

      if (tapGap < 300) {
        if (x < width / 3) {
          video.currentTime -= 10;
        } else if (x > (2 * width) / 3) {
          video.currentTime += 10;
        } else {
          video.paused ? video.play() : video.pause();
        }
      }
    };

    video.addEventListener("touchstart", handleTouchStart);
    video.addEventListener("touchend", handleTouchEnd);
    video.addEventListener("touchend", handleDoubleTap);

    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      clearInterval(studyTimer);
    };
  }, [m3u8Url]);

  const handleDownloadClick = () => {
    const fileName = `${chaptersName} ${lecturesName}`;
    const intentUrl = `intent:${m3u8Url}#Intent;action=android.intent.action.VIEW;package=idm.internet.download.manager;scheme=1dmdownload;S.title=${encodeURIComponent(fileName)};end`;
    window.location.href = intentUrl;
  };

  return (
    <div>
      <h2>{`Now Playing: ${chaptersName} - ${lecturesName || "Unknown Lecture"}`}</h2>

      <video ref={videoRef} controls playsInline style={{ width: "100%" }} />

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
          }}
        >
          Download Lecture
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer2;
