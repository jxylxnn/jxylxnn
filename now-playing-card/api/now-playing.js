const {
  getArtworkDataUri,
  getTrack,
  renderFallback,
  renderPlayer,
} = require("../lib/player");

module.exports = async function handler(_request, response) {
  response.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  response.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300",
  );
  response.setHeader("X-Content-Type-Options", "nosniff");

  try {
    const track = await getTrack();
    const artwork = await getArtworkDataUri(track);
    response.status(200).send(renderPlayer(track, artwork));
  } catch (error) {
    console.error(error);
    response.status(200).send(renderFallback());
  }
};
