import React, { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/Lectures.css";
import mlogo from "../assets/ntmlogo.jpg"; // ✅ Import logo

const Lectures9 = () => {
  const { subject } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const lectures = {
    Science: [
      { name: "Chapter 1", index: 0 },
      { name: "Chapter 2", index: 1 },
    ],
    Maths: [
      { name: "Chapter 1", index: 0 },
      { name: "Chapter 2", index: 1 },
    ],
    SST: [
      { name: "Chapter 1", index: 0 },
      { name: "Chapter 2", index: 1 },
    ],
    English: [{ name: "Chapter 1", index: 0 }],
    Hindi: [{ name: "Chapter 1", index: 0 }],
    Sanskrit: [{ name: "Chapter 1", index: 0 }],
    IT: [{ name: "Chapter 1", index: 0 }],
  };

  return (
    <div className="lectures-container">
      <img src={mlogo} alt="Logo" className="big-logo" />
      <h2>{subject} Lectures</h2>
      <div className="lecture-boxes">
        {lectures[subject]?.map((lecture, index) => (
          <Link
            key={index}
         to={`/chapter-lectures/9/${subject}/${lecture.index}`}
            className="lecture-box"
          >
            {lecture.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Lectures9;
