import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('https://api.penpencil.co/v3/batches/65df241600f257001881fbbd/details');
        const data = await res.json();

        if (data && data.batch && Array.isArray(data.batch.subjects)) {
          setSubjects(data.batch.subjects);
        } else {
          setError('Subjects data not found in the response.');
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {subjects.map((subject) => (
          <div
            key={subject._id}
            onClick={() => goToSubject(subject.slug)}
            style={{
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '10px',
              cursor: 'pointer',
              backgroundColor: '#f5f5f5',
              textAlign: 'center'
            }}
          >
            <img src={subject.icon} alt={subject.name} style={{ width: '50px', height: '50px' }} />
            <h3>{subject.name}</h3>
            <p>{subject.teacher?.name || 'No Teacher'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;
