import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LectureList = () => {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('https://api.penpencil.co/v3/batches/65df241600f257001881fbbd/details', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();

        if (data.success) {
          setSubjects(data.batch.subjects);
        } else {
          setError(data.message || 'Failed to load subjects');
        }
      } catch (err) {
        setError('Error fetching data');
      }
    };

    fetchSubjects();
  }, []);

  const goToSubject = (slug) => {
    navigate(`/subject/${slug}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Subjects</h2>
      {error && <p>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {subjects.map((subject) => (
          <div
            key={subject._id}
            onClick={() => goToSubject(subject.slug)}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
            }}
          >
            <img src={subject.icon} alt={subject.name} style={{ width: '40px', height: '40px' }} />
            <h3>{subject.name}</h3>
            <p>Teacher: {subject.teacher?.name || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureList;
