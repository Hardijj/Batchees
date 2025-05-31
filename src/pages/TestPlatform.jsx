import React, { useState, useEffect } from 'react';
import testData from './testdata';
import "../styles/styles.css";

const TestPlatform = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(600); // default 10 mins

  useEffect(() => {
    let interval;
    if (selectedTest) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedTest]);

  const handleOptionClick = (index) => {
    if (showAnswer) return;
    setSelectedOption(index);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setCurrentQuestion(q => Math.min(q + 1, testData[selectedSubject][selectedTest].length - 1));
    resetQA();
  };

  const handlePrev = () => {
    setCurrentQuestion(q => Math.max(q - 1, 0));
    resetQA();
  };

  const resetQA = () => {
    setSelectedOption(null);
    setShowAnswer(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedSubject) {
    return (
      <div className="container">
        <h1 className="heading">Choose a Subject</h1>
        <div className="grid">
          {Object.keys(testData).map(subject => (
            <div key={subject} className="card" onClick={() => setSelectedSubject(subject)}>
              {subject}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="container">
        <h1 className="heading">{selectedSubject} - Choose a Test</h1>
        <div className="grid">
          {Object.keys(testData[selectedSubject]).map(test => (
            <div key={test} className="card" onClick={() => setSelectedTest(test)}>
              {test}
            </div>
          ))}
        </div>
        <button className="back-btn" onClick={() => setSelectedSubject(null)}>← Back</button>
      </div>
    );
  }

  const current = testData[selectedSubject][selectedTest][currentQuestion];

  return (
    <div className="test-container">
      <div className="top-bar">
        <div>{selectedSubject} / {selectedTest}</div>
        <div>⏱ {formatTime(timer)}</div>
        <div>Q{currentQuestion + 1}/{testData[selectedSubject][selectedTest].length}</div>
      </div>

      <h2 className="question">{current.question}</h2>

      <div className="options">
        {current.options.map((opt, i) => {
          let className = "option";
          if (showAnswer) {
            if (i === current.correctAnswer) className += " correct";
            else if (i === selectedOption) className += " wrong";
          } else if (i === selectedOption) {
            className += " selected";
          }

          return (
            <div
              key={i}
              className={className}
              onClick={() => handleOptionClick(i)}
            >
              {opt}
            </div>
          );
        })}
      </div>

      {showAnswer && (
        <div className="explanation">
          <strong>Explanation:</strong> {current.explanation}
        </div>
      )}

      <div className="nav-buttons">
        <button onClick={handlePrev} disabled={currentQuestion === 0}>← Previous</button>
        <button onClick={handleNext} disabled={currentQuestion === testData[selectedSubject][selectedTest].length - 1}>Next →</button>
      </div>
    </div>
  );
};

export default TestPlatform;
