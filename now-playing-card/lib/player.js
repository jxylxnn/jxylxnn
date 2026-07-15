const FEED_URL =
  "https://lastfm-last-played.biancarosa.com.br/jxylxn/latest-song";
const PROFILE_URL = "https://www.last.fm/user/jxylxn";

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncate(value, maximum) {
  const text = String(value || "").trim();
  if (text.length <= maximum) return text;
  return `${text.slice(0, maximum - 1).trimEnd()}…`;
}

async function getTrack() {
  const response = await fetch(FEED_URL, {
    headers: { "user-agent": "jxylxn-github-now-playing/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Last.fm bridge returned ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.track) throw new Error("No recent track was returned");
  return payload.track;
}

async function getArtworkDataUri(track) {
  const images = Array.isArray(track.image) ? track.image : [];
  const preferred =
    images.find((image) => image.size === "large" && image["#text"]) ||
    [...images].reverse().find((image) => image["#text"]);

  if (!preferred) return null;

  const response = await fetch(preferred["#text"], {
    headers: { "user-agent": "jxylxn-github-now-playing/1.0" },
  });
  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}

function renderPlayer(track, artworkDataUri) {
  const isPlaying = track?.["@attr"]?.nowplaying === "true";
  const title = escapeXml(truncate(track?.name || "Waiting for a track", 34));
  const artist = escapeXml(
    truncate(track?.artist?.["#text"] || "Play something on YouTube Music", 42),
  );
  const album = escapeXml(truncate(track?.album?.["#text"] || "", 44));
  const status = isPlaying ? "NOW PLAYING" : "LAST PLAYED";
  const statusColor = isPlaying ? "#E3C27A" : "#A8A08B";
  const artwork = artworkDataUri
    ? `<image href="${artworkDataUri}" x="24" y="24" width="192" height="192" preserveAspectRatio="xMidYMid slice" clip-path="url(#coverClip)"/>`
    : `<rect x="24" y="24" width="192" height="192" rx="20" fill="url(#coverFallback)"/><text x="120" y="133" text-anchor="middle" font-size="54" fill="#F0E1C6">♫</text>`;
  const mainControl = isPlaying
    ? '<rect x="514" y="190" width="5" height="15" rx="2" fill="#252820"/><rect x="524" y="190" width="5" height="15" rx="2" fill="#252820"/>'
    : '<path d="M516 188 L516 207 L531 197.5 Z" fill="#252820"/>';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="240" viewBox="0 0 760 240" role="img" aria-label="${status}: ${title} by ${artist}">
  <title>${status}: ${title} by ${artist}</title>
  <defs>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#252820"/>
      <stop offset="0.58" stop-color="#303126"/>
      <stop offset="1" stop-color="#3D2B25"/>
    </linearGradient>
    <linearGradient id="coverFallback" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4F5840"/>
      <stop offset="1" stop-color="#7C4141"/>
    </linearGradient>
    <linearGradient id="signal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7C4141"/>
      <stop offset="0.55" stop-color="#9E5A57"/>
      <stop offset="1" stop-color="#E3C27A"/>
    </linearGradient>
    <clipPath id="coverClip">
      <rect x="24" y="24" width="192" height="192" rx="20"/>
    </clipPath>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.32"/>
    </filter>
  </defs>

  <rect x="1" y="1" width="758" height="238" rx="26" fill="url(#card)" stroke="#4F5840" stroke-width="2" filter="url(#shadow)"/>
  ${artwork}
  <rect x="24" y="24" width="192" height="192" rx="20" fill="none" stroke="#F0E1C6" stroke-opacity="0.12"/>

  <circle cx="248" cy="42" r="4" fill="${statusColor}"/>
  <text x="260" y="47" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="12" font-weight="700" letter-spacing="1.8" fill="${statusColor}">${status}</text>
  <text x="715" y="47" text-anchor="end" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="11" font-weight="600" letter-spacing="1.1" fill="#A8A08B">YOUTUBE MUSIC</text>

  <text x="244" y="88" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="28" font-weight="750" fill="#F0E1C6">${title}</text>
  <text x="244" y="116" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="17" font-weight="600" fill="#E3C27A">${artist}</text>
  <text x="244" y="141" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="13" fill="#A8A08B">${album}</text>

  <rect x="244" y="160" width="474" height="3" rx="1.5" fill="#4F5840"/>
  <rect x="244" y="160" width="292" height="3" rx="1.5" fill="url(#signal)"/>
  <circle cx="536" cy="161.5" r="5" fill="#E3C27A"/>

  <g fill="#A8A08B">
    <rect x="446" y="192" width="3" height="12" rx="1"/>
    <path d="M449 198 L463 190 L463 206 Z"/>
    <path d="M463 198 L477 190 L477 206 Z"/>
  </g>
  <circle cx="521.5" cy="197.5" r="22" fill="#F0E1C6"/>
  ${mainControl}
  <g fill="#A8A08B">
    <path d="M566 190 L580 198 L566 206 Z"/>
    <path d="M580 190 L594 198 L580 206 Z"/>
    <rect x="594" y="192" width="3" height="12" rx="1"/>
  </g>

  <g transform="translate(690 190)" fill="none" stroke="#A8A08B" stroke-width="2" stroke-linecap="round">
    <path d="M0 6 H6 L13 0 V16 L6 10 H0 Z" fill="#A8A08B" stroke="none"/>
    <path d="M17 4 C21 7 21 9 17 12"/>
  </g>
  <text x="244" y="205" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="11" letter-spacing="0.8" fill="#6B724B">SCROBBLED THROUGH LAST.FM</text>
</svg>`;
}

function renderFallback() {
  return renderPlayer(
    {
      name: "Waiting for your next track",
      artist: { "#text": "YouTube Music → Last.fm" },
      album: { "#text": "The player will refresh automatically" },
    },
    null,
  );
}

module.exports = {
  PROFILE_URL,
  getTrack,
  getArtworkDataUri,
  renderPlayer,
  renderFallback,
};
