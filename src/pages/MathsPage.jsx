import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MathsPage() {
  const [lectures, setLectures] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    fetch("/api/maths.php?api=1")
      .then(res => res.json())
      .then(data => {
        const startIndex = data.findIndex(l => l.name === "Trigonometry L2");
        const filtered = startIndex >= 0 ? data.slice(startIndex) : data;
        setLectures(filtered);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Maths Lectures</h2>
      {lectures.map((lecture, i) => (
        <Link
          key={i}
          to="/video/10/Maths/3"
          state={{ m3u8Url: lecture.m3u8Url, notesUrl: lecture.notesUrl }}
          style={{
            display: "block",
            padding: "15px",
            marginBottom: "10px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            textDecoration: "none",
            fontWeight: "bold",
            color: "black"
          }}
        >
          {lecture.name}
        </Link>
      ))}
    </div>
  );
            }
