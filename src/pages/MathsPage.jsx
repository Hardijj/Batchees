import React, { useEffect, useState } from "react";

const LectureList = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const apiUrl =
    "https://api.penpencil.co/v2/batches/65df241600f257001881fbbd/subject/chemistry-268936/topics?page=1";

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("❌ No access_token found in localStorage.");
      return;
    }

    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("❌ API request failed.");
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setData(json);
        } else {
          setData(json);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) return <pre>{error}</pre>;
  if (!data) return <p>⏳ Loading content...</p>;

  return (
    <div>
      <h2>✅ Full API Response</h2>
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default LectureList;
