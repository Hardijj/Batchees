import React, { useEffect, useState } from "react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    // Replace this with your actual API URL
    fetch("https://streamfiles.eu.org/api/batch_details.php?batch_id=65df241600f257001881fbbd&token=cu7oiBffDQbRGx7%2FOhKylmKZYPBubC4Euenu4PkHPj%2FOyu1vuQDaiYALB5VP7gczBnItWkSGb4ZYiZW6Efbg4FaOZfFRhjDNcPBpTZHHbvPfoU%2Bh7sEY9PRCq23lFIR0aUdsRede44EFSpV0r9LPFUIZtOSDgRF3kyFvp6%2Byzol4pKjtLNTEkl98uN3eQ5Bov7slpn%2BztdOUrMlpzbuZJaF3rJO9oFnzwBf5DQSEFUf%2BR2Y3PTNryrFltXwzG8TQS9YuUoWKNvCI5QRaQg2yhpqIZTeIXisbmJaonmuUQ48I7myj0ktC1BTyDtSFH9bYP%2Ba6cwhcMQLC8BlsaA5mwJ8EzYbzTdgrxXuiVWBPvcEOpNquK6%2FhE%2Fw%2FlHkp%2BWe32w1Qoh4Cu6aWaGywG0mjN7a220OsB5BScr%2F9ihMZ9fsDXS4OjfdxpAA6e7xtmQd9yuMKvygqhomjZZM0bX823QKbAnxQqISxvdmCxu8JLYYMoe6mlmMSpC5ghoomDMm4sNeFA%2Bsv0JrpLwGvGYL%2BlSygaFfZr%2BfFrC%2FT8oXtr7ICImoVEe38GAF29dmUYAQZHjBopGhiegHLqL2BVSD%2FwZc7Af0ybaSZh7EenA4rZIH%2FdYEgt9puDVJLKoMpIywUh8FpzML68EJQmRwyXPR1IbK8XcqokTNsRAMeSso98FQ%3D&type=details")
      .then(res => res.json())
      .then(data => {
        setSubjects(data); // Adjust this depending on actual structure
      });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      {subjects.map(subject => (
        <div key={subject._id} className="p-4 border rounded-xl shadow bg-white">
          <h2 className="text-lg font-bold">{subject.subject}</h2>
          <p className="text-sm text-gray-600">
            👨‍🏫 {subject.teacherIds[0]?.firstName} {subject.teacherIds[0]?.lastName}
          </p>
          {subject.schedules?.length > 0 && (
            <p className="text-sm text-gray-500">
              🕒 {subject.schedules[0].day}, {new Date(subject.schedules[0].startTime).toLocaleTimeString()} - {new Date(subject.schedules[0].endTime).toLocaleTimeString()}
            </p>
          )}
          {subject.fileId && (
            <a
              href={subject.fileId.baseUrl + subject.fileId.key}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 underline text-sm"
            >
              📎 Download Resource
            </a>
          )}
        </div>
      ))}
    </div>
  );
              }
