import React, { useEffect, useState } from "react";

const LectureList = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await fetch(
          "https://streamfiles.eu.org/api/contents.php?topic_slug=light---reflection-and-refraction-013795&type=videos&api_type=new&token=cu7oiBffDQbRGx7%2FOhKylmKZYPBubC4Euenu4PkHPj%2FOyu1vuQDaiYALB5VP7gczBnItWkSGb4ZYiZW6Efbg4FaOZfFRhjDNcPBpTZHHbvPfoU%2Bh7sEY9PRCq23lFIR0aUdsRede44EFSpV0r9LPFUIZtOSDgRF3kyFvp6%2Byzol4pKjtLNTEkl98uN3eQ5Bov7slpn%2BztdOUrMlpzbuZJaF3rJO9oFnzwBf5DQSEFUf%2BR2Y3PTNryrFltXwzG8TQS9YuUoWKNvCI5QRaQg2yhpqIZTeIXisbmJaonmuUQ48I7myj0ktC1BTyDtSFH9bYP%2Ba6cwhcMQLC8BlsaA5mwJ8EzYbzTdgrxXuiVWBPvcEOpNquK6%2FhE%2Fw%2FlHkp%2BWe32w1Qoh4Cu6aWaGywG0mjN7a220OsB5BScr%2F9ihMZ9fsDXS4OjfdxpAA6e7xtmQd9yuMKvygqhomjZZM0bX823QKbAnxQqISxvdmCxu8JLYYMoe6mlmMSpC5ghoomDMm4sNeFA%2Bsv0JrpLwGvGYL%2BlSygaFfZr%2BfFrC%2FT8oXtr7ICImoVEe38GAF29dmUYAQZHjBopGhiegHLqL2BVSD%2FwZc7Af0ybaSZh7EenA4rZIH%2FdYEgt9puDVJLKoMpIywUh8FpzML68EJQmRwyXPR1IbK8XcqokTNsRAMeSso98FQ%3D&subject_id=66068b2057eb78001800ec24&topic_id=67f1486544f0a7c755bd8fa2&batch_id=65df241600f257001881fbbd&subject_slug=physics-593096&content_type=new&encrypt=0"
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          setLectures(data);
        } else {
          setError("Invalid response format.");
        }
      } catch (err) {
        setError("Failed to fetch lectures: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Lectures</h1>

      {loading && <p>Loading lectures...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {lectures.length === 0 && !loading && !error && (
        <p>No lectures found.</p>
      )}

      <div style={{ display: "grid", gap: "20px" }}>
        {lectures.map((lecture) => (
          <div
            key={lecture.video_id}
            style={{
              border: "1px solid #ccc",
              padding: "16px",
              borderRadius: "8px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              background: "#f9f9f9",
            }}
          >
            <img
              src={lecture.video_poster}
              alt={lecture.video_title}
              style={{ width: "180px", borderRadius: "8px" }}
            />
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>{lecture.video_title}</h3>
              <p style={{ margin: "4px 0" }}>
                <strong>Upload Date:</strong>{" "}
                {new Date(lecture.upload_date).toLocaleDateString()}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Duration:</strong> {lecture.duration}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureList;
