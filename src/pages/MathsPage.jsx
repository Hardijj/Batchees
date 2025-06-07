import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://api.penpencil.co/v3/batches/65df241600f257001881fbbd/details')
      .then((res) => res.json())
      .then((data) => {
        const subs = data?.data?.subjects;
        if (Array.isArray(subs)) {
          setSubjects(subs);
        } else {
          setError('Subjects not found in API response.');
        }
      })
      .catch((err) => setError('Failed to load subjects: ' + err.message));
  }, []);

  const goToSubject = (slug) => {
    navigate(`/subject/${slug}`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Subjects</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {subjects.map((subject) => (
          <div
            key={subject._id}
            onClick={() => goToSubject(subject.slug)}
            style={{
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '10px',
              width: '200px',
              textAlign: 'center',
              background: '#f8f8f8',
            }}
          >
            <img
              src={subject.icon}
              alt={subject.name}
              style={{ width: '50px', height: '50px', marginBottom: '10px' }}
            />
            <h4>{subject.name}</h4>
            <p>{subject.teacher?.name || 'No Teacher'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;
