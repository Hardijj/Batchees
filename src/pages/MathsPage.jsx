import React, { useEffect, useState } from "react";

const SubjectsPage = () => {
  const [statusMessage, setStatusMessage] = useState("Checking API...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://streamfiles.eu.org/api/batch_details.php?batch_id=65df241600f257001881fbbd&token=cu7oiBffDQbRGx7%2FOhKylmKZYPBubC4Euenu4PkHPj%2FOyu1vuQDaiYALB5VP7gczBnItWkSGb4ZYiZW6Efbg4FaOZfFRhjDNcPBpTZHHbvPfoU%2Bh7sEY9PRCq23lFIR0aUdsRede44EFSpV0r9LPFUIZtOSDgRF3kyFvp6%2Byzol4pKjtLNTEkl98uN3eQ5Bov7slpn%2BztdOUrMlpzbuZJaF3rJO9oFnzwBf5DQSEFUf%2BR2Y3PTNryrFltXwzG8TQS9YuUoWKNvCI5QRaQg2yhpqIZTeIXisbmJaonmuUQ48I7myj0ktC1BTyDtSFH9bYP%2Ba6cwhcMQLC8BlsaA5mwJ8EzYbzTdgrxXuiVWBPvcEOpNquK6%2FhE%2Fw%2FlHkp%2BWe32w1Qoh4Cu6aWaGywG0mjN7a220OsB5BScr%2F9ihMZ9fsDXS4OjfdxpAA6e7xtmQd9yuMKvygqhomjZZM0bX823QKbAnxQqISxvdmCxu8JLYYMoe6mlmMSpC5ghoomDMm4sNeFA%2Bsv0JrpLwGvGYL%2BlSygaFfZr%2BfFrC%2FT8oXtr7ICImoVEe38GAF29dmUYAQZHjBopGhiegHLqL2BVSD%2FwZc7Af0ybaSZh7EenA4rZIH%2FdYEgt9puDVJLKoMpIywUh8FpzML68EJQmRwyXPR1IbK8XcqokTNsRAMeSso98FQ%3D&type=details"
        );

        if (response.ok) {
          setStatusMessage("✅ API is working! Status: " + response.status);
        } else {
          setStatusMessage("⚠️ API responded with error. Status: " + response.status);
        }
      } catch (error) {
        setStatusMessage("❌ Failed to reach API: " + error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <h1>Batch API Check</h1>
      <p>{statusMessage}</p>
    </div>
  );
};

export default SubjectsPage;
