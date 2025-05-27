import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const subjects = [
  { api: 'maths', name: 'Maths' },
  { api: 'chem', name: 'Chemistry' },
  { api: 'bio', name: 'Biology' },
  { api: 'phy', name: 'Physics' }
];

const LecturesPage = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadLectures = async (subject) => {
    setSelectedSubject(subject.name);
    setLectures([]);
    setLoading(true);
    try {
      const res = await fetch(`https://automate-eduvibe-nt11.wasmer.app/?api=${subject.api}`);
      const data = await res.json();
      setLectures(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setLectures([]);
    } finally {
      setLoading(false);
    }
  };

  const goToVideo = (index) => {
    navigate(`/video/11/${selectedSubject}/${index}`);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Class 10 Lectures</h1>

      <div style={{ marginBottom: 20 }}>
        {subjects.map((s) => (
          <button
            key={s.api}
            onClick={() => loadLectures(s)}
            style={{
              margin: 5,
              padding: '10px 16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {selectedSubject && <h2>{selectedSubject} Lectures</h2>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        lectures.map((lecture, index) => (
          <div
            key={index}
            onClick={() => goToVideo(index)}
            style={{
              margin: '10px 0',
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: 5,
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
          >
            {lecture.name}
          </div>
        ))
      )}
    </div>
  );
};

export default LecturesPage;
