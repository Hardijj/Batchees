import React, { useEffect, useState } from "react";

const LectureList = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const apiUrl =
    "https://api.penpencil.co/v2/batches/678a0324dab28c8848cc026f/subject/physics-254348/topics?page=1";

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
          setError("⚠️ API returned success: false.");
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
