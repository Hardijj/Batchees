import React, { useState, useEffect } from "react";
import { testData } from "./testdata";
import "../styles/styles.css";

export default function App() {
  const [subject, setSubject] = useState(null);
  const [testName, setTestName] = useState(null);
  const [stage, setStage] = useState("select"); // select or test

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // change to your time

  const startTest = (subject, test) => {
    setSubject(subject);
    setTestName(test);
    setStage("test");
    setCurrent(0);
    setSubmitted(false);
    setSelected(Array(testData[subject][test].length).fill(null));
    setTimeLeft(60); // customize per test
  };

  useEffect(() => {
    if (stage === "test" && !submitted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) {
      setSubmitted(true);
    }
  }, [timeLeft, stage, submitted]);

  const handleOptionClick = (index) => {
    const updated = [...selected];
    updated[current] = index;
    setSelected(updated);
  };

  const handleSubmit = () => setSubmitted(true);

  const getScore = () => {
    const questions = testData[subject][testName];
    return selected.reduce(
      (score, ans, idx) =>
        ans === questions[idx].answer ? score + 1 : score,
      0
    );
  };

  if (stage === "select") {
    return (
      <div className="page">
        <h1>Select Subject & Test</h1>
        <div className="subjects">
          {Object.keys(testData).map((sub) => (
            <div key={sub} className="card">
              <h2>{sub}</h2>
              {Object.keys(testData[sub]).map((test) => (
                <button key={test} onClick={() => startTest(sub, test)}>
                  {test}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TEST PAGE
  const questions = testData[subject][testName];
  return (
    <div className="page">
      <div className="header">
        <h2>{testName}</h2>
        <p>⏱ {timeLeft}s</p>
      </div>

      {!submitted ? (
        <div className="question-box">
          <p className="qtext">{questions[current].question}</p>
          <div className="options">
            {questions[current].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                className={
                  selected[current] === idx ? "option active" : "option"
                }
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="nav">
            <button onClick={() => setCurrent(current - 1)} disabled={current === 0}>
              Previous
            </button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(current + 1)}>Next</button>
            ) : (
              <button onClick={handleSubmit}>Submit</button>
            )}
          </div>
        </div>
      ) : (
        <div className="result">
          <h2>✅ Score: {getScore()} / {questions.length}</h2>
          {questions.map((q, idx) => (
            <div key={idx} className="review">
              <p><strong>Q{idx + 1}:</strong> {q.question}</p>
              <p className={selected[idx] === q.answer ? "correct" : "wrong"}>
                Your Answer: {q.options[selected[idx]] || "Not Answered"}
              </p>
              <p className="correct">Correct: {q.options[q.answer]}</p>
            </div>
          ))}
          <button onClick={() => setStage("select")}>Back to Subjects</button>
        </div>
      )}
    </div>
  );
                      }
