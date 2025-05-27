import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const subjects = [
  { name: 'Maths', api: 'maths' },
  { name: 'Physics', api: 'phy' },
  { name: 'Chemistry', api: 'chem' },
  { name: 'Biology', api: 'bio' }
];

const LecturesPage = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchLectures = async (api, name) => {
    setLoading(true);
    try {
      const res = await fetch(`https://automate-eduvibe-nt11.wasmer.app/?api=${api}`);
      const data = await res.json();
      setLectures(data);
      setSelectedSubject(name);
    } catch (err) {
      alert("Failed to fetch lectures.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subject) => {
    fetchLectures(subject.api, subject.name);
  };

  const goToVideo = (index) => {
    navigate(`/video/11/${selectedSubject}/${index}`);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      {!selectedSubject && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {subjects.map((subject) => (
            <div
              key={subject.api}
              onClick={() => handleSubjectClick(subject)}
              style={{
                backgroundColor: '#f0f0f0',
                padding: 30,
                textAlign: 'center',
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              {subject.name}
            </div>
          ))}
        </div>
      )}

      {selectedSubject && (
        <div>
          <h2 style={{ marginTop: 0 }}>{selectedSubject} Lectures</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {lectures.map((lecture, index) => (
                <div
                  key={index}
                  onClick={() => goToVideo(index)}
                  style={{
                    marginBottom: 10,
                    padding: 15,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                >
                  {lecture.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LecturesPage;
