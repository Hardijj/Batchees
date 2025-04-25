import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/global.css";
import tt from "../assets/tt.png";

const Subject10 = () => {
  const navigate = useNavigate();
  const [currentSubject, setCurrentSubject] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  // Timetable: subject per day and time
  const schedule = {
    Monday: { "17:00": "SST", "20:00": "Maths" },
    Tuesday: { "17:00": "SST", "20:00": "Maths" },
    Wednesday: { "17:00": "Science", "20:00": "SST" },
    Thursday: { "17:00": "Science", "20:00": "SST" },
    Friday: { "15:13": "Science", "15:17": "Maths" },
    Saturday: { "17:00": "Science", "20:00": "Maths" },
  };

  // Link mapping for each subject
  const subjectLinks = {
    SST: "https://d1kw75zcv4u98c.cloudfront.net/out/v1/c32c373c9874430cb6039408745a1a5e/index.m3u8",
    Maths: "https://d1kw75zcv4u98c.cloudfront.net/out/v1/287810d967cc428e9bd992002e55b72c/index.m3u8",
    Science: "https://d2xqn12y4qo6nr.cloudfront.net/out/v1/4dacc3cc62ed4047b817b91580e11584/index.m3u8",
  };

  // Check every minute if it's time to activate the link
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "long" });
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

      const currentTime = `${hours}:${minutes}`;
      const upcomingTimes = ["16:45", "19:45"]; // 15 mins before

      upcomingTimes.forEach((triggerTime) => {
        const [triggerHour, triggerMinute] = triggerTime.split(":");
        if (hours === triggerHour && minutes === triggerMinute) {
          const realTime = triggerTime === "16:45" ? "17:00" : "20:00";
          const subject = schedule[day]?.[realTime];
          if (subject) {
            setCurrentSubject(subject);
          }
        }
      });
    };

    checkSchedule(); // Check immediately on mount
    const interval = setInterval(checkSchedule, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const m3u8Url = subjectLinks[currentSubject];

  const subjects = [
    { name: "Notice", path: "/lectures/10/Notice" },
    { name: "Science", path: "/lectures/10/Science" },
    { name: "Maths", path: "/lectures/10/Maths" },
    { name: "SST", path: "/lectures/10/SST" },
    { name: "English", path: "/lectures/10/English" },
    { name: "Hindi", path: "/lectures/10/Hindi" },
    { name: "IT", path: "/lectures/10/IT" },
    { name: "Sanskrit", path: "/lectures/10/Sanskrit" },
  ];

  return (
    <div className="subjects-container">
      <img src={tt} alt="Logo" className="tt" />
      <h2>Select Subject - Class 10</h2>

      {m3u8Url && (
        <div className="live-class-container">
          <Link
            to={`/video/10/live`}
            state={{ chapterName: `Live Class - ${currentSubject}`, m3u8Url }}
            className="subject-box live-class-section"
          >
            🔴 Live Class - {currentSubject}
          </Link>
        </div>
      )}

      <div className="subject-boxes">
        {subjects.map((subject, index) => (
          <Link key={index} to={subject.path} className="subject-box">
            {subject.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Subject10;
