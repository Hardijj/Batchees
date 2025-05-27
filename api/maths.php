<?php
if ($_GET['api'] ?? false) {
  header('Content-Type: application/json');

  $targetUrl = "https://www.rolexcoderz.live/10me.php";
  $html = file_get_contents($targetUrl);

  // Extract video lectures
  preg_match_all('/<h3[^>]*>(.*?)<\/h3>.*?href="[^"]*Player\?url=([^"]+)"/si', $html, $videoMatches);
  preg_match_all('/<h3[^>]*>(.*?)<\/h3>.*?<a[^>]+href="([^"]+\.pdf)"/si', $html, $notesMatches);

  // Map notes
  $notesMap = [];
  foreach ($notesMatches[1] as $i => $notesH3) {
      $cleanTitle = preg_replace('/[^\w\s.\-L0-9]/u', '', $notesH3);
      $notesMap[trim($cleanTitle)] = $notesMatches[2][$i];
  }

  $lectures = [];
  foreach ($videoMatches[1] as $i => $rawTitle) {
      $cleanTitle = preg_replace('/[^\w\s.\-L0-9]/u', '', $rawTitle);
      preg_match('/(.*?)(L\d+)/i', $cleanTitle, $matches);
      $chapter = trim($matches[1] ?? $cleanTitle);
      $lectureTag = trim($matches[2] ?? '');
      $notesKey = $chapter . ' ' . $lectureTag;
      $notesUrl = $notesMap[$notesKey] ?? '';
      $decoded = urldecode($videoMatches[2][$i]);

      preg_match('#/(\d{7,})/(\d{7,})/index_1\.m3u8#', $decoded, $idMatch);
      if (isset($idMatch[2])) {
          $folder1 = $idMatch[1];
          $folder2 = $idMatch[2];
          $last7 = substr($folder2, -7);
          $m3u8Url = "https://d1qcficr3lu37x.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/$folder1/$folder2/{$folder2}_$last7.m3u8";
      } else {
          $m3u8Url = $decoded;
      }

      $lectures[] = [
          'name' => "$chapter $lectureTag",
          'm3u8Url' => $m3u8Url,
          'notesUrl' => $notesUrl
      ];
  }

  echo json_encode($lectures, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}
?>

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Lectures</title>
  <style>
    body {
      font-family: sans-serif;
      background: #f0f0f0;
      padding: 20px;
    }
    .lecture-box {
      background: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      cursor: pointer;
      font-weight: bold;
      text-decoration: none;
      color: black;
      display: block;
    }
  </style>
</head>
<body>
  <h2>Lectures</h2>
  <div id="app"></div>

  <!-- React & Babel -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-router-dom@6.22.0/umd/react-router-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script type="text/babel">
    const { createRoot } = ReactDOM;
    const { BrowserRouter, Link, useNavigate } = ReactRouterDOM;
    const root = createRoot(document.getElementById("app"));

    function App() {
      const [lectures, setLectures] = React.useState([]);
      const navigate = useNavigate();

      React.useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (!isLoggedIn) navigate("/login");

        fetch("?api=1")
          .then(res => res.json())
          .then(data => {
            const startIndex = data.findIndex(l => l.name === "Trigonometry L2");
            const filtered = startIndex >= 0 ? data.slice(startIndex) : [];
            setLectures(filtered);
          });
      }, []);

      return (
        <div>
          {lectures.map((lecture, i) => (
            <Link
              to="/video/10/Maths/3"
              state={{ m3u8Url: lecture.m3u8Url, notesUrl: lecture.notesUrl }}
              key={i}
              className="lecture-box"
            >
              {lecture.name}
            </Link>
          ))}
        </div>
      );
    }

    root.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  </script>
</body>
</html>
