import React, { useEffect, useState } from "react";

const SubjectsPage = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await fetch(
          "https://streamfiles.eu.org/api/contents.php?topic_slug=light---reflection-and-refraction-013795&type=videos&api_type=new&token=cu7oiBffDQbRGx7%2FOhKylmKZYPBubC4Euenu4PkHPj%2FOyu1vuQDaiYALB5VP7gczBnItWkSGb4ZYiZW6Efbg4FaOZfFRhjDNcPBpTZHHbvPfoU%2Bh7sEY9PRCq23lFIR0aUdsRede44EFSpV0r9LPFUIZtOSDgRF3kyFvp6%2Byzol4pKjtLNTEkl98uN3eQ5Bov7slpn%2BztdOUrMlpzbuZJaF3rJO9oFnzwBf5DQSEFUf%2BR2Y3PTNryrFltXwzG8TQS9YuUoWKNvCI5QRaQg2yhpqIZTeIXisbmJaonmuUQ48I7myj0ktC1BTyDtSFH9bYP%2Ba6cwhcMQLC8BlsaA5mwJ8EzYbzTdgrxXuiVWBPvcEOpNquK6%2FhE%2Fw%2FlHkp%2BWe32w1Qoh4Cu6aWaGywG0mjN7a220OsB5BScr%2F9ihMZ9fsDXS4OjfdxpAA6e7xtmQd9yuMKvygqhomjZZM0bX823QKbAnxQqISxvdmCxu8JLYYMoe6mlmMSpC5ghoomDMm4sNeFA%2Bsv0JrpLwGvGYL%2BlSygaFfZr%2BfFrC%2FT8oXtr7ICImoVEe38GAF29dmUYAQZHjBopGhiegHLqL2BVSD%2FwZc7Af0ybaSZh7EenA4rZIH%2FdYEgt9puDVJLKoMpIywUh8FpzML68EJQmRwyXPR1IbK8XcqokTNsRAMeSso98FQ%3D&subject_id=66068b2057eb78001800ec24&topic_id=67f1486544f0a7c755bd8fa2&batch_id=65df241600f257001881fbbd&subject_slug=physics-593096&content_type=new&encrypt=0"
        );
        const data = await response.json();

        // Replace `data.lectures` with the actual key containing the video array
        if (data && Array.isArray(data.lectures)) {
          setLectures(data.lectures);
        } else {
          setError("No lectures found.");
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
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Lectures</h1>

      {loading && <p>Loading lectures...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {lectures.map((lecture) => (
          <div
            key={lecture.video_id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
          >
            <img
              src={lecture.video_poster}
              alt="Poster"
              style={{ width: "100%", height: "180px", objectFit: "cover" }}
            />
            <div style={{ padding: "1rem" }}>
              <h3 style={{ fontSize: "1rem", margin: "0 0 0.5rem" }}>{lecture.video_title}</h3>
              <p style={{ margin: "0.25rem 0" }}>🕒 Duration: {lecture.duration}</p>
              <p style={{ margin: "0.25rem 0" }}>📅 Uploaded: {formatDate(lecture.upload_date)}</p>
              <a
                href={`https://example.com/play?video=${lecture.video_id}`}
                style={{
                  marginTop: "0.5rem",
                  display: "inline-block",
                  background: "#007bff",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  textDecoration: "none"
                }}
              >
                Watch Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsPage;
