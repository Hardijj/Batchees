import React, { useEffect, useState } from "react";

const LectureList = () => {
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState(null);

  const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NDk0NzQ5NjcuNTI1LCJkYXRhIjp7Il9pZCI6IjY2NzAxNTcyMjYzM2MwMzNmY2FmYjQ5YSIsInVzZXJuYW1lIjoiOTUxMDUxNTkyMyIsImZpcnN0TmFtZSI6IlZhbnNoIiwib3JnYW5pemF0aW9uIjp7Il9pZCI6IjVlYjM5M2VlOTVmYWI3NDY4YTc5ZDE4OSIsIndlYnNpdGUiOiJwaHlzaWNzd2FsbGFoLmNvbSIsIm5hbWUiOiJQaHlzaWNzd2FsbGFoIn0sImVtYWlsIjoidmFuc2hkZXZpZXJ3YWxhNjdAZ21haWwuY29tIiwicm9sZXMiOlsiNWIyN2JkOTY1ODQyZjk1MGE3NzhjNmVmIl0sImNvdW50cnlHcm91cCI6IklOIiwidHlwZSI6IlVTRVIifSwiaWF0IjoxNzQ4ODcwMTY3fQ.02xDLaTl3votjtQA1e8m6O37dTIQ20suFuQ0JdMbZOs";

  useEffect(() => {
    // Set access_token in localStorage
    localStorage.setItem("access_token", accessToken);

    // Fetch batch details using access_token
    fetch("https://api.penpencil.co/v3/batches/678a0324dab28c8848cc026f/details", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch batch data.");
        return res.json();
      })
      .then((data) => {
        setBatchData(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!batchData) return <div>Loading batch data...</div>;

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h2>📘 Batch Details</h2>
      <p><strong>Batch Name:</strong> {batchData.data?.name}</p>
      <p><strong>Batch Code:</strong> {batchData.data?.batchCode}</p>
      <p><strong>Course:</strong> {batchData.data?.course?.name}</p>
      <p><strong>Organization:</strong> {batchData.data?.organization?.name}</p>
      <p><strong>Status:</strong> {batchData.data?.status}</p>

      <h3>📅 Schedule</h3>
      <ul>
        {batchData.data?.schedule?.map((item, idx) => (
          <li key={idx}>
            <strong>{item?.day}</strong>: {item?.startTime} - {item?.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LectureList;
