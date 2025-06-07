import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SubjectChapters = () => {
  const { subject } = useParams(); // subject like 'chemistry-254347'
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 👇 Only one place to manually assign batch & subject mapping
    const subjectApiMap = {
      'chemistry-254347': 'https://api.penpencil.co/v2/batches/65df241600f257001881fbbd/subject/chemistry-254347/contents?page=1',
      'physics-254348': 'https://api.penpencil.co/v2/batches/65df241600f257001881fbbd/subject/physics-254348/contents?page=1',
      'maths-254349': 'https://api.penpencil.co/v2/batches/65df241600f257001881fbbd/subject/maths-254349/contents?page=1',
      // add more if needed
    };

    const apiUrl = subjectApiMap[subject];
    if (!apiUrl) {
      setError('Invalid subject.');
      return;
    }

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setChapters(data.data);
        } else {
          setError('No chapters found for this subject.');
        }
      })
      .catch((err) => setError('Fetch error: ' + err.message));
  }, [subject]);

  const goToChapter = (slug) => {
    navigate(`/chapter/${slug}`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>{subject.split('-')[0].toUpperCase()} Chapters</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {chapters.map((ch) => (
          <div
            key={ch._id}
            onClick={() => goToChapter(ch.slug)}
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '15px',
              width: '280px',
              cursor: 'pointer',
              background: '#f9f9f9',
            }}
          >
            <h4>{ch.name}</h4>
            <p>Type: {ch.type}</p>
            <p>Videos: {ch.videos}</p>
            <p>Exercises: {ch.exercises}</p>
            <p>Notes: {ch.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectChapters;
